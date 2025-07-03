// const Notification = require("../models/Notification");
// const User = require("../models/UserModel");

// // Create notification (admin only)
// exports.createNotification = async (req, res) => {
//   const { message } = req.body;

//   const notification = await Notification.create({
//     message,
//     sender: req.user._id,
//   });

//   const users = await User.find({ role: "user" });

//   for (const user of users) {
//     user.notifications.push(notification._id);
//     await user.save();
//   }

//   res.status(201).json({ success: true, notification });
// };

// // Get notifications for user
// exports.getNotifications = async (req, res) => {
//   const notifications = await Notification.find()
//     .populate("sender", "name avatar") // admin details
//     .sort({ date: -1 });

//   res.status(200).json({ success: true, notifications });
// };

// // Mark notification as read
// exports.markNotificationAsRead = async (req, res) => {
//   const { notificationId } = req.params;

//   const notification = await Notification.findById(notificationId);
//   if (!notification) return res.status(404).json({ message: "Not found" });

//   if (!notification.readBy.includes(req.user._id)) {
//     notification.readBy.push(req.user._id);
//     await notification.save();
//   }

//   res.status(200).json({ success: true, message: "Marked as read" });
// };

// // Admin: Update notification
// exports.updateNotification = async (req, res) => {
//   const { notificationId } = req.params;
//   const { message } = req.body;

//   const notification = await Notification.findById(notificationId);
//   if (!notification) return res.status(404).json({ message: "Not found" });

//   notification.message = message || notification.message;
//   await notification.save();

//   res.status(200).json({ success: true, message: "Updated" });
// };

// // Admin: Delete notification
// exports.deleteNotification = async (req, res) => {
//   const { notificationId } = req.params;

//   await Notification.findByIdAndDelete(notificationId);

//   // Optionally remove from user arrays
//   await User.updateMany({}, { $pull: { notifications: notificationId } });

//   res.status(200).json({ success: true, message: "Deleted" });
// };


const Notification = require("../models/Notification");
const User = require("../models/UserModel");

// Admin: Create a notification and assign to all users
exports.createNotification = async (req, res) => {
  const { message } = req.body;

  const notification = await Notification.create({
    message,
    sender: req.user._id,
  });

  // (Optional) Notify users in another way if needed

  res.status(201).json({ success: true, notification });
};

// Authenticated user: Get all notifications
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find()
    .populate("sender", "name avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, notifications });
};

// Authenticated user: Mark as read
exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  const alreadyRead = notification.readBy.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!alreadyRead) {
    notification.readBy.push(req.user._id);
    await notification.save();
  }

  res.status(200).json({ success: true, message: "Marked as read" });
};

// Admin: Update notification
exports.updateNotification = async (req, res) => {
  const { notificationId } = req.params;
  const { message } = req.body;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  notification.message = message || notification.message;
  await notification.save();

  res.status(200).json({ success: true, message: "Updated" });
};

// Admin: Delete notification
exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findByIdAndDelete(notificationId);

  res.status(200).json({ success: true, message: "Deleted" });
};
