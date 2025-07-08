// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Create the upload directory if it doesn't exist
// const uploadDir = path.join(__dirname, '../uploads/courses');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp/;
//   const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowedTypes.test(file.mimetype);
//   if (ext && mime) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
//   }
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter
// });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/courses');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

module.exports = upload;