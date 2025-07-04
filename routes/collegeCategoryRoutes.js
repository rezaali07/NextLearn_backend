// // routes/collegeCategoryRoutes.js

// const express = require("express");
// const {
//   createCategory,
//   getAllCategories,
//   updateCategory,
//   deleteCategory,
// } = require("../controller/collegeCategoryController");

// const { isAuthenticatedUser, authorizedRoles} = require("../middleware/auth");
// const router = express.Router();

// // Public
// router.get("/", getAllCategories);

// // Admin
// router.post("/", isAuthenticatedUser, authorizedRoles('admin'), createCategory);
// router.put("/:slug", isAuthenticatedUser, authorizedRoles('admin'), updateCategory);
// router.delete("/:slug", isAuthenticatedUser, authorizedRoles('admin'), deleteCategory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controller/collegeCategoryController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const upload = require("../middleware/upload.js"); // adjust path as needed

router.get("/", getAllCategories);

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
