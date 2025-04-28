const mongoose=require("mongoose");
const meetingSchema=mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, 
    startTime: { type: Date, required: true },   // 👈 Start Time
    endTime: { type: Date, required: true },      // 👈 End Time
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        //   status: { type: String, enum: ['invited', 'accepted', 'declined'], default: 'invited' }
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
},
{
    timestamps: true,
}
)
module.exports = mongoose.model('Meeting', meetingSchema);