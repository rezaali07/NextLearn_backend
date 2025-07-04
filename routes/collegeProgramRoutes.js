const express = require("express");
const router = express.Router();
const {
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram,
  getProgramBySlug,  // <-- add this
} = require("../controller/collegeProgramController");

const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const upload = require("../middleware/upload.js");

// Public routes
router.get("/", getAllPrograms);
router.get("/:slug", getProgramBySlug);  // <--- ADD THIS

// Admin routes
router.post(
  "/",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  upload.fields([{ name: "programImage", maxCount: 1 }]),
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
