const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

// Routes for categories
router.post("/", isAuthenticatedUser, authorizedRoles("admin"), createCategory);
router.get("/", getCategories);
router.put("/:id", isAuthenticatedUser, authorizedRoles("admin"), updateCategory);
router.delete("/:id", isAuthenticatedUser, authorizedRoles("admin"), deleteCategory);

module.exports = router;
