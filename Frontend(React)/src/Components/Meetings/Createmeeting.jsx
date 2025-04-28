import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { toast, ToastContainer } from "react-toastify";

export default function CreateMeeting() {
  const navigate = useNavigate();

  const [meetingData, setMeetingData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: "",
    description: "",
  });

  const [conflictDetected, setConflictDetected] = useState(false);
  const [alternateDates, setAlternateDates] = useState([]);
  const [participantNames, setParticipantNames] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true,
        });
        setCurrentUserEmail(res.data.email);
        setCurrentUserId(res.data._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Authentication failed. Please log in again.");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setMeetingData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFetchParticipants = async () => {
    if (!currentUserEmail) {
      toast.info("Fetching user info... Please wait.");
      return;
    }

    const emails = meetingData.participants
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email !== currentUserEmail.toLowerCase());

    if (emails.length === 0) {
      toast.error("Please enter participant emails (excluding yourself).");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/members", { emails });

      if (res.data && res.data.participants) {
        setParticipantNames(res.data.participants);
        setMeetingData((prev) => ({
          ...prev,
          participants: emails.join(", "),
        }));
      } else {
        toast.error("No participants found for the provided emails.");
        setParticipantNames([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching participants.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, startTime, endTime, description } = meetingData;
    const participantIds = participantNames.map((p) => p.id);

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const payload = {
      title,
      description,
      date,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      participantIds,
      user_id: currentUserId, // Pass the user ID to backend
    };

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/schedulemeeting", payload);

      if (res.data.message === "Conflict detected with existing meetings.") {
        setConflictDetected(true); // Conflict detected, show alternate days button
        toast.error("Conflict detected with existing meetings.");
      } else {
        toast.success("Meeting Created Successfully!");
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAlternateDays = async () => {
    try {
      setLoading(true);

      // Prepare date and time objects for the conflict
      const startDateTime = new Date(`${meetingData.date}T${meetingData.startTime}`);
      const endDateTime = new Date(`${meetingData.date}T${meetingData.endTime}`);

      const res = await axios.post("http://localhost:3000/otherdates", {
        date: meetingData.date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        participants: participantNames.map((p) => p.id),
        user_id: currentUserId, // Send user ID
      });
      console.log(res.data);
      if (res.data.suggestedSlots) {
        setAlternateDates(res.data.suggestedSlots); // Store alternate dates
        toast.success("Alternate dates found!");
      } else {
        toast.error("No alternate dates available.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching alternate dates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-2xl space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Schedule Meeting</h1>
            <p className="text-gray-500">Organize your next gathering easily!</p>
            {currentUserEmail && (
              <p className="text-sm text-gray-400 mt-2">
                Logged in as: <span className="font-semibold">{currentUserEmail}</span>
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Meeting Title */}
            <div className="relative">
              <input
                type="text"
                name="title"
                value={meetingData.title}
                onChange={handleChange}
                required
                className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
                placeholder="Meeting Title"
              />
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Meeting Title
              </label>
            </div>

            {/* Meeting Description */}
            <div className="relative">
              <textarea
                name="description"
                value={meetingData.description}
                onChange={handleChange}
                required
                className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
                placeholder="Meeting Description"
              />
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Meeting Description
              </label>
            </div>

            {/* Participants */}
            <div className="relative">
              <input
                type="text"
                name="participants"
                value={meetingData.participants}
                onChange={handleChange}
                required
                className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
                placeholder="Participants (comma separated emails)"
              />
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Participants (comma separated emails)
              </label>
            </div>

            {/* Fetch Participants Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleFetchParticipants}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition mt-4"
              >
                {loading ? "Loading..." : "Fetch Participants"}
              </button>
            </div>

            {/* Display Participants */}
            {participantNames.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Selected Participants:</h3>
                <ul className="list-disc ml-5 text-gray-600">
                  {participantNames.map((p, idx) => (
                    <li key={idx}>
                      {p.name} (Email: {p.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                name="date"
                value={meetingData.date}
                onChange={handleChange}
                required
                className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
              />
              <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Meeting Date
              </label>
            </div>

            {/* Time Pickers */}
            <div className="flex gap-4">
              <div className="relative w-full">
                <input
                  type="time"
                  name="startTime"
                  value={meetingData.startTime}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
                />
                <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                  Start Time
                </label>
              </div>
              <div className="relative w-full">
                <input
                  type="time"
                  name="endTime"
                  value={meetingData.endTime}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-3 placeholder-transparent"
                />
                <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                  End Time
                </label>
              </div>
            </div>

            {/* Conflict Warning */}
            {conflictDetected && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-600">Conflict Detected!</h3>
                <p className="text-sm text-gray-700">Please review the conflict and check alternate dates:</p>
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={handleSeeAlternateDays}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "See Alternate Days"}
                  </button>
                </div>
              </div>
            )}

            {/* Alternate Dates */}
            {alternateDates.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Suggested Alternate Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {alternateDates.map((slot, idx) => {
                  const startDate = new Date(slot.startTime);
                  const endDate = new Date(slot.endTime);

                  return (
                    <div
                      key={idx}
                      className="bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-xl transition duration-300 p-6 flex flex-col justify-between"
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="text-gray-800 font-medium text-xl">
                          {startDate.toLocaleDateString()}{" "}
                          <span className="text-gray-500">|</span>{" "}
                          {startDate.toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500 text-sm">
                          <span className="font-semibold">Start:</span> {startDate.toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500 text-sm">
                          <span className="font-semibold">End:</span> {endDate.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                disabled={loading}
              >
                {loading ? "Creating Meeting..." : "Create Meeting"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
