const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter course title"],
  },
  description: {
    type: String,
    required: [true, "Please enter course description"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  type: {
    type: String,
    enum: ["Free", "Paid"],
    default: "Free",
  },
  price: {
    type: Number,
    default: 0,
  },
  author: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  images: [{
    type: String, // Cloudinary URL or relative path
  }],
  lessons: [lessonSchema],
  quizzes: [quizSchema],

  // Likes
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  // Favorites
  favorite: {
    type: Number,
    default: 0,
  },
  favoriteBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  // ✅ Purchased Users
  purchasedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

}, {
  timestamps: true,
});

module.exports = mongoose.model("Course", courseSchema);
