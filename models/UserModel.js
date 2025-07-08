const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your name"],
    maxlength: [50, "Name can't be more than 50 characters"],
    minlength: [3, "Name can't be less than 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },

  // ✅ Quiz progress tracking
  quizProgress: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      answers: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          selectedOption: String,
          isCorrect: Boolean,
        },
      ],
      date: {
        type: Date,
        default: Date.now,
      },
    }
  ],

  // ✅ Lesson progress tracking
  lessonProgress: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      lessonsCompleted: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
      ],
      startDate: {
        type: Date,
        default: Date.now,
      },
      lastCompletedDate: {
        type: Date,
      },
      revisionCount: {
        type: Number,
        default: 0,
      },
    },
  ],

  // ✅ Activity log
  activityLog: [
    {
      action: {
        type: String, // e.g. "liked", "favorited", "quiz_attempt", "course_started"
        required: true,
      },
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      details: {
        type: String, // optional text like quiz score or note
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // ✅ Notifications
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],

  // ✅ New User Tour Tracker
  isFirstTimeUser: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  resetPasswordToken: String,
  resetPasswordDate: Date,
});

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 JWT token generator
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// 🔐 Compare entered password
userSchema.methods.comparePassword = async function (enteredpassword) {
  return await bcrypt.compare(enteredpassword, this.password);
};

// 🔁 Forgot password token generator
userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTime = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
