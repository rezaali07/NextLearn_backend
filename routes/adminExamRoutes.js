const express = require('express');
const router = express.Router();
const adminCtrl = require('../controller/adminExamController');
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all routes: user must be authenticated AND have admin role
router.use(isAuthenticatedUser, authorizedRoles("admin"));

// Level routes
router.post('/levels', adminCtrl.createLevel);
router.get('/levels', adminCtrl.getLevels);
router.put('/levels/:id', adminCtrl.updateLevel);
router.delete('/levels/:id', adminCtrl.deleteLevel);

// ExamSource routes (Universities or Boards)
router.post('/universities', adminCtrl.createExamSource);
router.get('/universities', adminCtrl.getExamSources);
router.put('/universities/:id', adminCtrl.updateExamSource);
router.delete('/universities/:id', adminCtrl.deleteExamSource);

// Program routes
router.post('/programs', adminCtrl.createProgram);
router.get('/programs', adminCtrl.getPrograms);
router.put('/programs/:id', adminCtrl.updateProgram);
router.delete('/programs/:id', adminCtrl.deleteProgram);

// Semester routes
router.post('/semesters', adminCtrl.createSemester);
router.get('/semesters', adminCtrl.getSemesters);
router.put('/semesters/:id', adminCtrl.updateSemester);
router.delete('/semesters/:id', adminCtrl.deleteSemester);

// Exam routes
router.post('/exams',
  upload.fields([
    { name: 'officialRoutineImage', maxCount: 1 },
    { name: 'examNoticeImage', maxCount: 1 },
  ]),
  adminCtrl.createExam
);
router.get('/exams', adminCtrl.getExams);
router.put('/exams/:id',
  upload.fields([
    { name: 'officialRoutineImage', maxCount: 1 },
    { name: 'examNoticeImage', maxCount: 1 },
  ]),
  adminCtrl.updateExam
);
router.delete('/exams/:id', adminCtrl.deleteExam);

// ExamRoutine routes

router.post('/exam-routines', upload.fields([
  { name: 'officialRoutineImage', maxCount: 1 },
  { name: 'examNoticeImage', maxCount: 1 },
]), adminCtrl.createExamRoutine);
router.get('/exam-routines', adminCtrl.getExamRoutines);
router.put('/exam-routines/:id', 
  upload.fields([
    { name: 'officialRoutineImage', maxCount: 1 },
    { name: 'examNoticeImage', maxCount: 1 }
  ]), 
  adminCtrl.updateExamRoutine
);

router.delete('/exam-routines/:id', adminCtrl.deleteExamRoutine);


module.exports = router;