const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
  }
});

// Add a pre-save hook to lowercase name before saving
categorySchema.pre("save", function (next) {
  this.name = this.name.toLowerCase();
  next();
});

module.exports = mongoose.model("Category", categorySchema);
