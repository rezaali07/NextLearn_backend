const mongoose = require("mongoose");

const ExamSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String },
  type: { type: String }, // e.g., university, board
});

module.exports = mongoose.model("ExamSource", ExamSourceSchema);
