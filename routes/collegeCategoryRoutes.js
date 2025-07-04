const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,  // <-- add this
} = require("../controller/collegeCategoryController");

const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const upload = require("../middleware/upload.js");

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);  // <--- ADD THIS

// Admin routes
router.post(
  "/",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  upload.fields([{ name: "categoryImage", maxCount: 1 }]),
  createCategory
);

router.put(
  "/:slug",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  upload.fields([{ name: "categoryImage", maxCount: 1 }]),
  updateCategory
);

router.delete(
  "/:slug",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  deleteCategory
);

module.exports = router;
