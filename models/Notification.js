// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     message: {
//       type: String,
//       required: true,
//     },
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     readBy: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//   },
//   { timestamps: true } // Adds createdAt and updatedAt automatically
// );


// module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who sent it
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who read it
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model("Notification", notificationSchema);
