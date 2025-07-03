const mongoose = require("mongoose");

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  content: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: true });

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      options: {
        type: [String],
        required: true,
        validate: {
          validator: function (val) {
            return val.length >= 2;
          },
          message: "At least two options are required.",
        },
      },
      correctAnswer: {
        type: String,
        required: true,
      },
    }
  ],
}, { _id: true });

// Main Course Schema
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
  },
  images: [
    {
      type: String, // Cloudinary URL or local path
    }
  ],

  // Nested Content
  lessons: [lessonSchema],
  quizzes: [quizSchema],

  // User Engagement
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  favorite: {
    type: Number,
    default: 0,
  },
  favoriteBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  // Purchases
  purchasedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model("Course", courseSchema);
