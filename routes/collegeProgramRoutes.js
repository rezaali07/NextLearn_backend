// routes/collegeProgramRoutes.js

const express = require("express");
const router = express.Router();
const {
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram,
} = require("../controller/collegeProgramController");

const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const upload = require("../middleware/upload.js"); // ✅ Use same logic as category

// Public
router.get("/", getAllPrograms);

// Admin
router.post(
  "/",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  upload.fields([{ name: "programImage", maxCount: 1 }]), // ✅ Use matching field name
  createProgram
);

router.put(
  "/:slug",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  upload.fields([{ name: "programImage", maxCount: 1 }]),
  updateProgram
);

router.delete(
  "/:slug",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  deleteProgram
);

module.exports = router;
