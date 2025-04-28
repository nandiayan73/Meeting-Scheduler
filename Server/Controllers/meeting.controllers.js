const express = require('express');
const router = express.Router();
const Meeting = require('../models/meeting.model');// Meeting model
const User = require('../models/user.model');       // User model
const mongoose = require('mongoose');
require('dotenv').config();
const mail=process.env.MAIL;
const appPassword=process.env.MAILPASSWORD;

const authenticate = require('../middlewares/auth'); 

// Setting the mail options:
const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP
  const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: mail,      //  Gmail address
    pass: appPassword,          //  Gmail app password 
  }
});




// POST /meetings - Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime, endTime, participantIds, date, user_id } = req.body;

    // Validate input
    if (!title || !date || !startTime || !endTime || !participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meetingDate = new Date(date);
    meetingDate.setHours(0, 0, 0, 0);

    if (meetingDate < today) {
      return res.status(400).json({ message: 'Meeting date cannot be in the past.' });
    }

    // Helper function to combine date + time
    const combineDateAndTime = (dateStr, timeStr) => {
      const date = new Date(dateStr);
      const time = new Date(timeStr);
      const combined = new Date(date);
      combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
      return combined;
    };

    const meetingStartDateTime = combineDateAndTime(date, startTime);
    const meetingEndDateTime = combineDateAndTime(date, endTime);

    if (meetingStartDateTime >= meetingEndDateTime) {
      return res.status(400).json({ message: 'Start time must be before end time.' });
    }

    // Include creator in participants if not already included
    const allParticipantIds = [...new Set([...participantIds, user_id.toString()])];
    const validParticipantIds = allParticipantIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    // Conflict detection
    const conflictingMeetings = await Meeting.find({
      participants: {
        $elemMatch: {
          user: { $in: validParticipantIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      startTime: { $lt: meetingEndDateTime },
      endTime: { $gt: meetingStartDateTime }
    });

    if (conflictingMeetings.length > 0) {
      return res.status(201).json({ message: 'Conflict detected with existing meetings.', conflicts: conflictingMeetings });
    }

    // Create Meeting
    const newMeeting = new Meeting({
      title,
      description,
      date: meetingDate,
      startTime: meetingStartDateTime,
      endTime: meetingEndDateTime,
      createdBy: user_id,
      participants: allParticipantIds.map(id => ({
        user: id,
      }))
    });

    await newMeeting.save();

    // Send Emails
    const invitedUsers = await User.find({ _id: { $in: participantIds } }).select('email name');
    console.log(invitedUsers);
    for (const user of invitedUsers) {
      await sendEmail(
        user.email,
        `Invitation: ${title}`,
        `Hi ${user.name},\n\nYou have been invited to the meeting "${title}".\nDate: ${meetingDate.toDateString()}\nStart: ${meetingStartDateTime.toLocaleTimeString()}\nEnd: ${meetingEndDateTime.toLocaleTimeString()}\n\nPlease join the meeting.\n\nThanks!`
      );
    }

    return res.status(201).json({ message: 'Meeting created successfully.', meeting: newMeeting });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

  // Define sendEmail:
  
  const sendEmail = async (to, subject, text, html = '') => {
    try {
      const mailOptions = {
        from: mail,
        to: to,
        subject: subject,
        text: text,
        html: html
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
  
      return info;
    } 
    catch (error) 
    {
      console.error('Error sending email:', error);
      throw error;
    }
  };
  const suggestAvailableSlots = async (req, res) => {
    try {
      const { date, startTime, endTime, participants, user_id } = req.body;
      
      const selectedDate = new Date(date); 
      const meetingStartTime = new Date(startTime); 
      const meetingEndTime = new Date(endTime); 
      const userIds = [...participants, user_id]; // Add user ID to participants
  
      const existingMeetings = await Meeting.find({
        participants: {
          $elemMatch: {
            user: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        startTime: {
          $gte: new Date(selectedDate.setDate(selectedDate.getDate() - 2)), 
        },
        endTime: {
          $lte: new Date(new Date(date).setDate(selectedDate.getDate() + 5)) 
        }
      }).select('startTime endTime participants');
  
      const userBusyTimes = {};
  
      userIds.forEach(id => {
        userBusyTimes[id] = [];
      });
  
      existingMeetings.forEach(meeting => {
        meeting.participants.forEach(participant => {
          const id = participant.user.toString();
          if (userBusyTimes[id]) {
            userBusyTimes[id].push({
              startTime: new Date(meeting.startTime),
              endTime: new Date(meeting.endTime),
            });
          }
        });
      });
  
      const isSlotFreeForAll = (proposedStart, proposedEnd) => {
        return userIds.every(id => {
          return userBusyTimes[id].every(meeting => {
            return (proposedEnd <= meeting.startTime || proposedStart >= meeting.endTime);
          });
        });
      };
  
      const suggestedSlots = [];
      const minutesStep = 30; 
      const maxDaysToCheck = 5;
  
      for (let dayOffset = 0; dayOffset <= maxDaysToCheck; dayOffset++) {
        const day = new Date(date);
        day.setDate(day.getDate() + dayOffset);
  
        let dayStart = new Date(day.setHours(9, 0, 0, 0)); 
        let dayEnd = new Date(day.setHours(18, 0, 0, 0)); 
        while (dayStart < dayEnd) {
          const proposedStart = new Date(dayStart);
          const proposedEnd = new Date(dayStart.getTime() + (meetingEndTime - meetingStartTime));
  
          if (proposedEnd > dayEnd) {
            break;
          }
  
          if (isSlotFreeForAll(proposedStart, proposedEnd)) {
            suggestedSlots.push({
              startTime: proposedStart,
              endTime: proposedEnd
            });
          }
  
          dayStart = new Date(dayStart.getTime() + minutesStep * 60000); 
        }
  
        if (suggestedSlots.length >= 3) break; 
      }
  
      console.log(suggestedSlots);
      if (suggestedSlots.length > 0) {
        return res.status(200).json({
          message: 'Suggested available slots found.',
          suggestedSlots: suggestedSlots.map(slot => ({
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString()
          }))
        });
      } else {
        return res.status(404).json({ message: 'No available slots found in the next 5 days.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
    }
  };
  
  
  const getUserMeetings = async (req, res) => {
    try {
      const userId = req.body.user_id;  
  
      const userMeetings = await Meeting.find({
        participants: {
          $elemMatch: {
            user: userId // The current user is a participant
          }
        }
      }).populate('participants.user', 'name email')  
  
      if (userMeetings.length === 0) {
        return res.status(404).json({ message: 'No meetings found for this user.' });
      }
      console.log(userMeetings.length);
      return res.status(200).json({
        message: 'Meetings found.',
        meetings: userMeetings.map(meeting => ({
          title: meeting.title,
          description: meeting.description,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          participants: meeting.participants.map(participant => ({
            userId: participant.user._id,
          }))
        }))
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  };
  
module.exports = {createMeeting,suggestAvailableSlots,getUserMeetings};


// // GET /meetings/:meetingId/participants-status - Get participant statuses for a meeting
// const getMeetingParticipantStatus = async (req, res) => {
//     try {
//       const meetingId = req.params.meetingId;
//       const userId = req.user._id;
  
//       // Find the meeting
//       const meeting = await Meeting.findById(meetingId)
//         .populate('participants.user', 'name email') // populate user details (adjust fields as needed)
//         .exec();
  
//       if (!meeting) {
//         return res.status(404).json({ message: 'Meeting not found.' });
//       }
  
//       // Check if the requester is the creator of the meeting
//       if (meeting.createdBy.toString() !== userId.toString()) {
//         return res.status(403).json({ message: 'Only the creator can view participant statuses.' });
//       }
  
//       // Group participants based on their status
//       const accepted = [];
//       const declined = [];
//       const invited = [];
  
//       meeting.participants.forEach(participant => {
//         const userInfo = {
//           _id: participant.user._id,
//           name: participant.user.name,
//           email: participant.user.email,
//         };
  
//         if (participant.status === 'accepted') {
//           accepted.push(userInfo);
//         } else if (participant.status === 'declined') {
//           declined.push(userInfo);
//         } else if (participant.status === 'invited') {
//           invited.push(userInfo);
//         }
//       });
  
//       return res.status(200).json({
//         meetingId: meeting._id,
//         title: meeting.title,
//         accepted,
//         declined,
//         invited
//       });
  
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Server error.' });
//     }
//   };
  
//   module.exports = { getMeetingParticipantStatus };
  
// // User's interaction with the meetings
// // POST /meetings/:meetingId/accept - User accepts the meeting
// const acceptMeeting = async (req, res) => {
//     try {
//       const meetingId = req.params.meetingId;
//       const userId = req.user._id; // Get the authenticated user's ID
  
//       // Find the meeting by meetingId
//       const meeting = await Meeting.findById(meetingId);
//       if (!meeting) {
//         return res.status(404).json({ message: 'Meeting not found.' });
//       }
  
//       // Check if the user is a participant in the meeting
//       const participantIndex = meeting.participants.findIndex(
//         participant => participant.user.toString() === userId.toString()
//       );
      
//       if (participantIndex === -1) {
//         return res.status(400).json({ message: 'User is not invited to this meeting.' });
//       }
  
//       // Check if the user's status is 'invited' and update to 'accepted'
//       if (meeting.participants[participantIndex].status === 'invited') {
//         meeting.participants[participantIndex].status = 'accepted';
//       } else {
//         return res.status(400).json({ message: 'User has already responded to the meeting.' });
//       }
  
//       // Save the updated meeting
//       await meeting.save();
  
//       return res.status(200).json({ message: 'Meeting accepted successfully.', meeting });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Server error.' });
//     }
//   };
  
// // POST /meetings/:meetingId/decline - User declines the meeting
// const declineMeeting = async (req, res) => {
//     try {
//       const meetingId = req.body.meetingId;
//       const userId = req.body.user._id; // Get the authenticated user's ID
  
//       // Find the meeting by meetingId
//       const meeting = await Meeting.findById(meetingId);
//       if (!meeting) {
//         return res.status(404).json({ message: 'Meeting not found.' });
//       }
  
//       // Check if the user is a participant in the meeting
//       const participantIndex = meeting.participants.findIndex(
//         participant => participant.user.toString() === userId.toString()
//       );
  
//       if (participantIndex === -1) {
//         return res.status(400).json({ message: 'User is not invited to this meeting.' });
//       }
  
//       // Check if the user's status is 'invited' and update to 'declined'
//       if (meeting.participants[participantIndex].status === 'invited') {
//         meeting.participants[participantIndex].status = 'declined';
//       } else {
//         return res.status(400).json({ message: 'User has already responded to the meeting.' });
//       }
  
//       // Save the updated meeting
//       await meeting.save();
  
//       return res.status(200).json({ message: 'Meeting declined successfully.', meeting });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Server error.' });
//     }
//   };
  
  

