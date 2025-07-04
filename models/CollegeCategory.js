const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, lowercase: true, unique: true },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("CollegeCategory", schema);
