const mongoose = require("mongoose");

const ExamRoutineSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String },

  officialRoutineImage: {
    public_id: String,
    url: String,
  },
  examNoticeImage: {
    public_id: String,
    url: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("ExamRoutine", ExamRoutineSchema);
