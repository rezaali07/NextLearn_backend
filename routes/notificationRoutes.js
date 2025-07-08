const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  updateNotification,
  deleteNotification,
} = require("../controller/notificationController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

// Admin-only
router.post("/", isAuthenticatedUser, authorizedRoles("admin"), createNotification);
router.put("/:notificationId", isAuthenticatedUser, authorizedRoles("admin"), updateNotification);
router.delete("/:notificationId", isAuthenticatedUser, authorizedRoles("admin"), deleteNotification);

// User routes
router.get("/", isAuthenticatedUser, getNotifications);
router.put("/:notificationId/read", isAuthenticatedUser, markNotificationAsRead);

module.exports = router;
