const mongoose = require("mongoose");

const collegeProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String, // This will store the path of the uploaded image
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollegeProgram", collegeProgramSchema);
