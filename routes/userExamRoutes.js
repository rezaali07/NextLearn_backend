const express = require("express");
const router = express.Router();
const userCtrl = require("../controller/userExamController");

// ===== PUBLIC ROUTES =====
router.get("/levels", userCtrl.getLevels);
router.get("/sources", userCtrl.getExamSources);
router.get("/programs", userCtrl.getPrograms);
router.get("/semesters", userCtrl.getSemesters);
router.get("/exams", userCtrl.getExams);
router.get("/exams/:id/routines", userCtrl.getExamRoutines);
router.get("/exam-routines", userCtrl.getExamRoutines);



module.exports = router;
