const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.js');
const {
  createCollege,
  updateCollege,
  getAllColleges,
  getCollege,
  deleteCollege,
} = require('../controller/collegeController');

// Upload config for multer
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

// Public routes
router.get('/', getAllColleges);
router.get('/:slug', getCollege);

// Protected routes (add your auth middleware as needed)
router.post('/', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, createCollege);

router.put('/:slug', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, updateCollege);

router.delete('/:slug', deleteCollege);

module.exports = router;
