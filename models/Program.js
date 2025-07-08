const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: "ExamSource", required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  totalSemesters: { type: Number, default: 8 },
});

module.exports = mongoose.model("Program", ProgramSchema);
