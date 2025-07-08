const express = require("express");
const fileUpload = require("express-fileupload");
const {
  createUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  userDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  sendNotificationToAll,
  getMyNotifications,
  markNotificationAsRead,
  updateTourStatus,
} = require("../controller/UserController");
const {
  isAuthenticatedUser,
  authorizedRoles,
  auth,
} = require("../middleware/auth");
const { getCourseProgress } = require("../controller/courseController");

const router = express.Router();

// Public routes
router.route("/register").post(fileUpload({ useTempFiles: true }), createUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

// Authenticated user routes
router.route("/me/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/updates").put(auth, updatePassword);

router
  .route("/me/update/profile")
  .put(
    isAuthenticatedUser,
    fileUpload({ useTempFiles: true }), // apply only here
    updateProfile
  );

router
  .route("/me/update/profiles")
  .put(auth, fileUpload({ useTempFiles: true }), updateProfile); // flutter version

router.route("/me").get(isAuthenticatedUser, userDetails);
router.route("/userdetails").get(auth, userDetails);


// Admin routes
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllUsers);


router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteUser);

// Admin route to send notifications
router.post('/notify-all', isAuthenticatedUser, authorizedRoles('admin'), sendNotificationToAll);

// Get current user's notifications
router.get('/me', isAuthenticatedUser, getMyNotifications);

// Mark a notification as read
router.patch('/read/:notificationId', isAuthenticatedUser, markNotificationAsRead);


// ✅ Update first-time tour status
router.put("/update-tour-status", isAuthenticatedUser, updateTourStatus);

module.exports = router;
