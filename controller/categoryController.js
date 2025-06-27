const Category = require("../models/CategoryModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create Category
exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;
  const normalized = name.trim().toLowerCase();

  const exists = await Category.findOne({ name: normalized });
  if (exists) {
    return next(new ErrorHandler("Category name must be unique", 400));
  }

  const category = await Category.create({ name: normalized });

  res.status(201).json({ success: true, category });
});

// Get All
exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, categories });
});

// Update
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;
  const updated = await Category.findByIdAndUpdate(
    req.params.id,
    { name: name.trim().toLowerCase() },
    { new: true, runValidators: true }
  );
  if (!updated) return next(new ErrorHandler("Category not found", 404));
  res.status(200).json({ success: true, category: updated });
});

// Delete
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return next(new ErrorHandler("Category not found", 404));
  res.status(200).json({ success: true, message: "Category deleted" });
});
