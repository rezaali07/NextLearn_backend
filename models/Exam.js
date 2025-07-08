const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["semester", "general"], required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: "ExamSource", required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  category: { type: String }, // Optional extra classification
  examDate: { type: Date, required: true },
  officialRoutineImage: {
    public_id: String,
    url: String,
  },
  examNoticeImage: {
    public_id: String,
    url: String,
  },
  status: {
  type: String,
  enum: ["upcoming", "ongoing", "completed"],
  default: "upcoming",
},
}, { timestamps: true });

module.exports = mongoose.model("Exam", ExamSchema);
