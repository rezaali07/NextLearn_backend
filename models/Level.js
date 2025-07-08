const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Level", LevelSchema);
