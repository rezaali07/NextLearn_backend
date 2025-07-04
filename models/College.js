const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, lowercase: true, unique: true },
  description: String,
  established: Number,
  province: String,
  district: String,
  city: String,
  address: String,
  latitude: Number,
  longitude: Number,
  website: String,
  email: String,
  phone: String,
  affiliation: String,
  type: String,
  collegePrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollegeProgram" }],
  collegeCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollegeCategory" }],
  intakes: [String],
  hostelAvailable: Boolean,
  library: Boolean,
  sportsFacilities: Boolean,
  wifiAvailable: Boolean,
  transportation: Boolean,
  logo: String,
  coverImage: String,
  gallery: [String],
}, { timestamps: true });

module.exports = mongoose.model("College", schema);
