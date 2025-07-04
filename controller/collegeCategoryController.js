const CollegeCategory = require("../models/CollegeCategory");
const slugify = require("slugify");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);

    const imagePath = req.files?.categoryImage?.[0]?.path || null;

    const category = await CollegeCategory.create({
      name,
      slug,
      image: imagePath,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CollegeCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const { name } = req.body;

    const newSlug = slugify(name);
    const updateData = { name, slug: newSlug };

    if (req.files?.categoryImage?.[0]) {
      updateData.image = req.files.categoryImage[0].path;
    }

    const updated = await CollegeCategory.findOneAndUpdate(
      { slug },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await CollegeCategory.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await CollegeCategory.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};