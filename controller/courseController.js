const Course = require('../models/Course');
const Category = require('../models/CategoryModel');
const User = require('../models/UserModel');
const path = require('path');
const fs = require('fs');
// Helper to log activity in user
async function logUserActivity(userId, action, courseId, details = '') {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    user.activityLog.push({
      action,
      course: courseId,
      details,
      date: new Date(),
    });
    await user.save();
  } catch (err) {
    console.error("Failed to log user activity:", err);
  }
}

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, type, price, author } = req.body;

    if (!title || !description || !category || !type || !author) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (type === "Paid" && (!price || price <= 0)) {
      return res.status(400).json({ success: false, message: "Invalid price for paid course" });
    }

    const categoryData = await Category.findOne({ name: category });
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const imagePaths = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/courses/${file.filename}`)
      : [];

    const course = new Course({
      title,
      description,
      category: categoryData._id,
      type,
      price: type === "Paid" ? price : 0,
      author,
      createdBy: req.user?.id || "Unknown",
      images: imagePaths
    });

    await course.save();

    res.status(201).json({ success: true, message: "Course created successfully", course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category', 'name')
      .select('_id title description price images type likes'); // ✅ include _id
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category')
      .populate('createdBy', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category')
      .populate('createdBy', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const { title, videoUrl, content, order } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.lessons.push({ title, videoUrl, content, order });
    await course.save();
    res.status(201).json(course.lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const lesson = course?.lessons.id(req.params.lessonId);
    if (!course || !lesson) return res.status(404).json({ message: 'Lesson or Course not found' });
    Object.assign(lesson, req.body);
    await course.save();
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const lesson = course?.lessons.id(req.params.lessonId);
    if (!course || !lesson) return res.status(404).json({ message: 'Lesson or Course not found' });
    lesson.remove();
    await course.save();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.type === 'Paid') {
      const user = await User.findById(req.user.id);
      if (!user.purchasedCourses.includes(course._id.toString())) {
        return res.status(403).json({ success: false, message: 'Please purchase the course to access lessons' });
      }
    }

    res.status(200).json({ success: true, lessons: course.lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, description, questions } = req.body;

    // Validate basic fields
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: "Quiz must include a title and an array of questions"
      });
    }

    // Validate questions
    for (const q of questions) {
      if (
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        !q.correctAnswer
      ) {
        return res.status(400).json({
          error: "Each question must have questionText, at least 2 options, and correctAnswer"
        });
      }

      if (!q.options.includes(q.correctAnswer)) {
        return res.status(400).json({
          error: `Correct answer must be one of the options in question: "${q.questionText}"`
        });
      }
    }

    // Add quiz
    course.quizzes.push({ title, description, questions });
    await course.save();

    res.status(201).json({ success: true, quizzes: course.quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const quiz = course?.quizzes.id(req.params.quizId);
    if (!course || !quiz) return res.status(404).json({ message: 'Quiz or Course not found' });
    Object.assign(quiz, req.body);
    await course.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const quiz = course?.quizzes.id(req.params.quizId);
    if (!course || !quiz) return res.status(404).json({ message: 'Quiz or Course not found' });
    quiz.remove();
    await course.save();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseQuizzes = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ success: true, quizzes: course.quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------- LIKES & FAVORITES --------
exports.likeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.likedBy.includes(req.user.id)) {
      course.likedBy.push(req.user.id);
      course.likes = course.likedBy.length;
      await course.save();

      // Log user activity
      await logUserActivity(req.user.id, 'liked', course._id.toString());
    }

    res.status(200).json({ message: 'Course liked', likes: course.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlikeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.likedBy = course.likedBy.filter(userId => userId.toString() !== req.user.id);
    course.likes = course.likedBy.length;
    await course.save();

    res.status(200).json({ message: 'Course unliked', likes: course.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLikedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ likedBy: req.user.id })
      .populate("category createdBy", "name email");
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.favoriteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.favoriteBy.includes(req.user.id)) {
      course.favoriteBy.push(req.user.id);
      course.favorite = course.favoriteBy.length;
      await course.save();

      // Log user activity
      await logUserActivity(req.user.id, 'favorited', course._id.toString());
    }

    res.status(200).json({ message: 'Course favorited', favorites: course.favorite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unfavoriteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.favoriteBy = course.favoriteBy.filter(userId => userId.toString() !== req.user.id);
    course.favorite = course.favoriteBy.length;
    await course.save();

    res.status(200).json({ message: 'Course unfavorited', favorites: course.favorite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavoritedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ favoriteBy: req.user.id })
      .populate("category createdBy", "name email");

    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------- PURCHASE & LESSON COMPLETION --------
exports.purchaseCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!Array.isArray(course.purchasedBy)) {
      course.purchasedBy = [];
    }

    if (course.purchasedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    course.purchasedBy.push(req.user.id);
    await course.save();

    // Log user activity
    await logUserActivity(req.user.id, 'purchased', course._id.toString());

    res.status(200).json({ success: true, message: "Course purchased" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getPurchasedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ purchasedBy: req.user.id })
      .populate('category createdBy', 'name email');
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// In courseController.js
exports.canAccessCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.type === "Free") {
      return res.status(200).json({ success: true, access: true, message: "Free course. Access granted." });
    }

    const purchased = user.purchasedCourses.includes(course._id);

    if (purchased) {
      return res.status(200).json({ success: true, access: true, message: "Access granted. You purchased this course." });
    } else {
      return res.status(403).json({ success: false, access: false, message: "You must purchase this course to access it." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an existing course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (typeof req.body.title === 'string') course.title = req.body.title;
    if (typeof req.body.description === 'string') course.description = req.body.description;
    if (req.body.price !== undefined) course.price = Number(req.body.price);

    await course.save();

    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEarningsSummary = async (req, res) => {
  try {
    const courses = await Course.find().populate("purchasedBy", "_id");

    let totalRevenue = 0;
    let totalSales = 0;
    const courseStats = [];

    for (const course of courses) {
      const purchaseCount = course.purchasedBy.length;
      const revenue = purchaseCount * (course.price || 0);

      totalRevenue += revenue;
      totalSales += purchaseCount;

      courseStats.push({
        courseId: course._id,
        title: course.title,
        purchaseCount,
        revenue,
      });
    }

    // Sort top-selling
    const topSelling = [...courseStats].sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 5);

    res.status(200).json({
      success: true,
      totalRevenue,
      totalSales,
      courseStats,
      topSelling,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPurchasedUsersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "purchasedBy",
      select: "name email avatar", // choose the user fields you want
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.json({
      success: true,
      courseId: course._id,
      courseTitle: course.title,
      purchasedUsers: course.purchasedBy,
    });
  } catch (error) {
    console.error("Error in getPurchasedUsersByCourse:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Save user quiz progress
exports.saveQuizProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, score, answers } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or course not found" });
    }

    const quiz = course.quizzes[0]; // or however you're storing it
    const totalQuestions = quiz?.questions?.length || 0;

    user.quizProgress.push({
      course: courseId,
      score,
      answers,
      date: new Date(),
    });

    // 🔥 Add activity log
    user.activityLog.push({
      action: "quiz_attempt",
      course: courseId,
      details: `${score}/${totalQuestions}`, // ✅ <-- here
      date: new Date(),
    });

    await user.save();

    res.status(200).json({ success: true, message: "Quiz progress saved" });
  } catch (error) {
    console.error("Error saving quiz progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get logged-in user's quiz progress
exports.getQuizProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("quizProgress.course", "title")
      .select("quizProgress");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, progress: user.quizProgress });
  } catch (error) {
    console.error("Error fetching quiz progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.toggleLessonCompletion = async (req, res) => {
  const userId = req.user._id;
  const { id: courseId, lessonId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let progress = user.lessonProgress.find(
      (entry) => entry.course.toString() === courseId
    );

    if (!progress) {
      user.lessonProgress.push({
        course: courseId,
        lessonsCompleted: [lessonId],
        startDate: new Date(),
        lastCompletedDate: new Date(),
      });
    } else {
      const index = progress.lessonsCompleted.findIndex(
        (id) => id.toString() === lessonId
      );

      if (index === -1) {
        progress.lessonsCompleted.push(lessonId);
      } else {
        progress.lessonsCompleted.splice(index, 1);
      }

      progress.lastCompletedDate = new Date(); // ✅ UPDATE THIS
    }

    await user.save();
    res.status(200).json({ success: true, message: "Lesson toggled" });
  } catch (error) {
    console.error("Lesson completion toggle failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// courseController.js
exports.getLessonProgress = async (req, res) => {
  const userId = req.user._id;
  const courseId = req.params.id;

  try {
    const user = await User.findById(userId);
    const progress = user.lessonProgress.find(
      (entry) => entry.course.toString() === courseId
    );

    return res.status(200).json({
      success: true,
      courseId,
      // <-- key must match what the frontend is reading
      lessonsCompleted: progress?.lessonsCompleted || [],
    });
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching lesson progress",
    });
  }
};

// Get user's course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("lessonProgress.course");

    const progressData = user.lessonProgress.map((entry) => {
      const totalLessons = entry.course?.lessons?.length || 0;
      const completed = entry.lessonsCompleted.length;
      const completion = totalLessons
        ? Math.round((completed / totalLessons) * 100)
        : 0;

      const startDate = new Date(entry.startDate);
      const lastCompleted = entry.lastCompletedDate
        ? new Date(entry.lastCompletedDate)
        : new Date();

      const timeDiffDays = Math.max(
        1,
        Math.ceil((lastCompleted - startDate) / (1000 * 60 * 60 * 24))
      );

      return {
        course: {
          title: entry.course.title,
          _id: entry.course._id,
        },
        startDate: entry.startDate,
        completedDate: entry.lastCompletedDate,
        lessonsCompleted: entry.lessonsCompleted,
        totalLessons: totalLessons,
        completion,
        timeSpent: timeDiffDays,
      };
    });

    res.status(200).json({ success: true, progress: progressData });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch progress", error });
  }
};

// Get user's activity history
exports.getUserActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('activityLog.course', 'title') // include course title
      .select('activityLog');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Sort descending by date
    const sortedLogs = [...user.activityLog].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ success: true, activityLog: sortedLogs });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity history" });
  }
};



exports.getCoursesByCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;

    const courses = await Course.find({ category: categoryId });

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};



exports.searchCourses = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    if (!searchTerm) {
      return res.status(400).json({ error: "Please provide a search query" });
    }

    // Case-insensitive regex search on title or description
    const regex = new RegExp(searchTerm, "i");

    const courses = await Course.find({
      $or: [{ title: regex }, { description: regex }],
    }).populate("category", "name");

    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error during search" });
  }
};
