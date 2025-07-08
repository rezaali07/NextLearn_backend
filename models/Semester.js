const mongoose = require("mongoose");

const SemesterSchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  number: { type: Number, required: true }, // e.g., 1, 2, 3...
  name: { type: String, required: true },   // e.g., "First Semester"
}, { timestamps: true });

SemesterSchema.index({ program: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Semester", SemesterSchema);
