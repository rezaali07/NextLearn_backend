const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createCourse,
  getAllCourses,
  getPublicCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseLessons,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  likeCourse,
  unlikeCourse,
  getLikedCourses,
  favoriteCourse,
  unfavoriteCourse,
  getFavoritedCourses,
  purchaseCourse,
  getPurchasedCourses,
  toggleLessonCompletion,
  saveQuizProgress,
  getQuizProgress,
} = require('../controller/courseController');

const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');
const { canAccessCourse } = require('../controller/courseController');

// ----------- Ensure Upload Directory Exists ------------
const uploadPath = path.join(__dirname, '../uploads/courses');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ---------------- Multer Configuration -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
});

// ----------------- Logging Middleware ------------------
router.use((req, res, next) => {
  console.log(`📡 [API] ${req.method} ${req.url}`);
  next();
});

// -------------------- Public Routes --------------------
router.get('/public', getPublicCourses);
router.get('/:id/likes', async (req, res) => {
  const Course = require('../models/Course');
  try {
    const course = await Course.findById(req.params.id).select('likedBy');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ likes: course.likedBy?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------- Authenticated Non-Admin Routes ------------
router.get('/liked', isAuthenticatedUser, getLikedCourses);
router.get('/favorited', isAuthenticatedUser, getFavoritedCourses);
router.get('/purchased', isAuthenticatedUser, getPurchasedCourses);

router.post('/:id/like', isAuthenticatedUser, likeCourse);
router.post('/:id/unlike', isAuthenticatedUser, unlikeCourse);
router.post('/:id/favorite', isAuthenticatedUser, favoriteCourse);
router.post('/:id/unfavorite', isAuthenticatedUser, unfavoriteCourse);
router.post('/:id/purchase', isAuthenticatedUser, purchaseCourse);
router.post('/:id/lessons/:lessonId/complete', isAuthenticatedUser, toggleLessonCompletion);

router.get('/:id/lessons', isAuthenticatedUser, getCourseLessons);
router.get('/:id/quizzes', isAuthenticatedUser, getCourseQuizzes);
router.post('/quiz/progress', isAuthenticatedUser, saveQuizProgress);
router.get("/me/quiz-progress", isAuthenticatedUser, getQuizProgress);

router.get('/:id/can-access', isAuthenticatedUser, canAccessCourse);

// -------------------- Admin Routes ---------------------
router.post('/', isAuthenticatedUser, authorizedRoles('admin'), upload.array('images', 5), createCourse);
router.get('/', isAuthenticatedUser, authorizedRoles('admin'), getAllCourses);
router.put('/:id', isAuthenticatedUser, authorizedRoles('admin'), updateCourse);
router.delete('/:id', isAuthenticatedUser, authorizedRoles('admin'), deleteCourse);

router.post('/:id/lessons', isAuthenticatedUser, authorizedRoles('admin'), addLesson);
router.put('/:id/lessons/:lessonId', isAuthenticatedUser, authorizedRoles('admin'), updateLesson);
router.delete('/:id/lessons/:lessonId', isAuthenticatedUser, authorizedRoles('admin'), deleteLesson);

router.post('/:id/quizzes', isAuthenticatedUser, authorizedRoles('admin'), addQuiz);
router.put('/:id/quizzes/:quizId', isAuthenticatedUser, authorizedRoles('admin'), updateQuiz);
router.delete('/:id/quizzes/:quizId', isAuthenticatedUser, authorizedRoles('admin'), deleteQuiz);

// ------------- Final Route: Get Course by ID -----------
router.get('/:id', getCourseById); // Should come last to avoid route conflicts

// ---------- Earnings Summary for Admin (NEW) -----------
const { getEarningsSummary } = require('../controller/courseController');

router.get(
  "/admin/earnings-summary",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  getEarningsSummary
);

// get course by user
const { getPurchasedUsersByCourse } = require("../controller/courseController");

router.get(
  "/:courseId/purchased-users",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  getPurchasedUsersByCourse
);


module.exports = router;
