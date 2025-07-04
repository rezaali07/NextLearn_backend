// const College = require("../models/College");
// const slugify = require("slugify");

// exports.updateCollege = async (req, res) => {
//   try {
//     let data = req.body;

//     if (data.name) data.slug = slugify(data.name);

//     // Convert boolean strings to booleans
//     const booleanFields = ["hostelAvailable", "library", "sportsFacilities", "wifiAvailable", "transportation"];
//     booleanFields.forEach(field => {
//       if (field in data) data[field] = data[field] === "true" || data[field] === true;
//     });

//     // Convert single strings to arrays for multi-select fields
//     if (typeof data.collegePrograms === "string") {
//       data.collegePrograms = [data.collegePrograms];
//     }
//     if (typeof data.collegeCategories === "string") {
//       data.collegeCategories = [data.collegeCategories];
//     }

//     // Handle files from multer
//     if (req.files?.logo) data.logo = req.files.logo[0].path;
//     if (req.files?.coverImage) data.coverImage = req.files.coverImage[0].path;
//     if (req.files?.gallery) data.gallery = req.files.gallery.map(file => file.path);

//     // Update college in DB
//     const college = await College.findOneAndUpdate({ slug: req.params.slug }, data, { new: true });

//     res.json(college);
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.deleteCollege = async (req, res) => {
//   await College.findOneAndDelete({ slug: req.params.slug });
//   res.json({ message: "College deleted" });
// };

// exports.getAllColleges = async (req, res) => {
//   const colleges = await College.find()
//     .populate("collegePrograms")
//     .populate("collegeCategories");
//   res.json(colleges);
// };

// exports.getCollege = async (req, res) => {
//   const college = await College.findOne({ slug: req.params.slug })
//     .populate("collegePrograms")
//     .populate("collegeCategories");

//   if (!college) return res.status(404).json({ error: "Not found" });
//   res.json(college);
// };

// exports.createCollege = async (req, res) => {
//   try {
//     let data = req.body;
//     data.slug = slugify(data.name);

//     const booleanFields = ["hostelAvailable", "library", "sportsFacilities", "wifiAvailable", "transportation"];
//     booleanFields.forEach(field => {
//       if (field in data) data[field] = data[field] === "true" || data[field] === true;
//     });

//     data.logo = req.files?.logo?.[0]?.path;
//     data.coverImage = req.files?.coverImage?.[0]?.path;
//     data.gallery = req.files?.gallery?.map(file => file.path) || [];

//     const college = await College.create(data);
//     res.status(201).json(college);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

const College = require('../models/College');
const slugify = require('slugify');

exports.createCollege = async (req, res) => {
  try {
    let data = req.body;

    data.slug = slugify(data.name);

    // Convert boolean strings
    ['hostelAvailable', 'library', 'sportsFacilities', 'wifiAvailable', 'transportation'].forEach(field => {
      if (field in data) data[field] = data[field] === 'true' || data[field] === true;
    });

    // Convert single string to array for multi-select fields
    if (typeof data.collegePrograms === 'string') data.collegePrograms = [data.collegePrograms];
    if (typeof data.collegeCategories === 'string') data.collegeCategories = [data.collegeCategories];

    // Files from multer
    if (req.files?.logo) data.logo = req.files.logo[0].path.replace(/\\/g, '/');
    if (req.files?.coverImage) data.coverImage = req.files.coverImage[0].path.replace(/\\/g, '/');
    if (req.files?.gallery) data.gallery = req.files.gallery.map(f => f.path.replace(/\\/g, '/'));

    const college = await College.create(data);
    res.status(201).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCollege = async (req, res) => {
  try {
    let data = req.body;

    if (data.name) data.slug = slugify(data.name);

    ['hostelAvailable', 'library', 'sportsFacilities', 'wifiAvailable', 'transportation'].forEach(field => {
      if (field in data) data[field] = data[field] === 'true' || data[field] === true;
    });

    if (typeof data.collegePrograms === 'string') data.collegePrograms = [data.collegePrograms];
    if (typeof data.collegeCategories === 'string') data.collegeCategories = [data.collegeCategories];

    if (req.files?.logo) data.logo = req.files.logo[0].path.replace(/\\/g, '/');
    if (req.files?.coverImage) data.coverImage = req.files.coverImage[0].path.replace(/\\/g, '/');
    if (req.files?.gallery) data.gallery = req.files.gallery.map(f => f.path.replace(/\\/g, '/'));

    const college = await College.findOneAndUpdate({ slug: req.params.slug }, data, { new: true });
    if (!college) return res.status(404).json({ error: 'College not found' });

    res.json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllColleges = async (req, res) => {
  const colleges = await College.find()
    .populate('collegePrograms')
    .populate('collegeCategories');
  res.json(colleges);
};

exports.getCollege = async (req, res) => {
  const college = await College.findOne({ slug: req.params.slug })
    .populate('collegePrograms')
    .populate('collegeCategories');
  if (!college) return res.status(404).json({ error: 'College not found' });
  res.json(college);
};

exports.deleteCollege = async (req, res) => {
  await College.findOneAndDelete({ slug: req.params.slug });
  res.json({ message: 'College deleted' });
};
