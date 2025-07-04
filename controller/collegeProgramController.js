// controller/collegeProgramController.js

const CollegeProgram = require("../models/CollegeProgram");
const slugify = require("slugify");

exports.createProgram = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);

    const image = req.files?.programImage?.[0]?.path;

    const program = await CollegeProgram.create({
      name,
      slug,
      image,
    });

    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await CollegeProgram.find().sort({ name: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const slug = req.params.slug;
    const { name } = req.body;

    const updatedData = {
      name,
      slug: slugify(name),
    };

    if (req.files?.programImage?.[0]?.path) {
      updatedData.image = req.files.programImage[0].path;
    }

    const updated = await CollegeProgram.findOneAndUpdate({ slug }, updatedData, { new: true });

    if (!updated) return res.status(404).json({ error: "Program not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const deleted = await CollegeProgram.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: "Program not found" });

    res.json({ message: "Program deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// collegeProgramController.js
exports.getProgramBySlug = async (req, res) => {
  try {
    const program = await CollegeProgram.findOne({ slug: req.params.slug });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
