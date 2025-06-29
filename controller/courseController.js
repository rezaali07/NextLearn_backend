const Course = require('../models/Course');
const Category = require('../models/CategoryModel');
const User = require('../models/UserModel');
const path = require('path');
const fs = require('fs');

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

// exports.updateCourse = async (req, res) => {
//   try {
//     const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: 'Course not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


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

// exports.addQuiz = async (req, res) => {
//   try {
//     const { question, options, correctAnswer, order } = req.body;
//     const course = await Course.findById(req.params.id);
//     if (!course) return res.status(404).json({ message: 'Course not found' });
//     course.quizzes.push({ question, options, correctAnswer, order });
//     await course.save();
//     res.status(201).json(course.quizzes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
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

// exports.getCourseQuizzes = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     if (course.type === 'Paid') {
//       const user = await User.findById(req.user.id);
//       if (!user.purchasedCourses.includes(course._id.toString())) {
//         return res.status(403).json({ success: false, message: 'Please purchase the course to access quizzes' });
//       }
//     }

//     res.status(200).json({ success: true, quizzes: course.quizzes });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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

    // Ensure purchasedBy array exists
    if (!Array.isArray(course.purchasedBy)) {
      course.purchasedBy = [];
    }

    // Prevent double-purchase
    if (course.purchasedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    course.purchasedBy.push(req.user.id);
    await course.save();

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


exports.toggleLessonCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const existing = user.completedLessons.find(
      (item) => item.courseId.toString() === courseId && item.lessonId.toString() === lessonId
    );

    if (existing) {
      user.completedLessons = user.completedLessons.filter(
        (item) => !(item.courseId.toString() === courseId && item.lessonId.toString() === lessonId)
      );
    } else {
      user.completedLessons.push({ courseId, lessonId });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: existing ? "Lesson marked incomplete" : "Lesson marked complete",
    });
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
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add progress
    user.quizProgress.push({
      course: courseId,
      score,
      answers,
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

