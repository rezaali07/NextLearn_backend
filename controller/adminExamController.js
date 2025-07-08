const Level = require("../models/Level");
const ExamSource = require("../models/ExamSource");
const Program = require("../models/Program");
const Semester = require("../models/Semester");
const Exam = require("../models/Exam");
const ExamRoutine = require("../models/ExamRoutine");
const cloudinary = require("cloudinary").v2;

// ===== LEVEL =====
exports.createLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLevels = async (_, res) => {
  const levels = await Level.find();
  res.json(levels);
};

exports.updateLevel = async (req, res) => {
  const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(level);
};

exports.deleteLevel = async (req, res) => {
  await Level.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ===== EXAM SOURCE =====
exports.createExamSource = async (req, res) => {
  try {
    const source = await ExamSource.create(req.body);
    res.status(201).json(source);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getExamSources = async (_, res) => {
  const sources = await ExamSource.find();
  res.json(sources);
};

exports.updateExamSource = async (req, res) => {
  const source = await ExamSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(source);
};

exports.deleteExamSource = async (req, res) => {
  await ExamSource.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ===== PROGRAM =====
exports.createProgram = async (req, res) => {
  const program = await Program.create(req.body);
  res.status(201).json(program);
};

exports.getPrograms = async (_, res) => {
  const programs = await Program.find().populate("source level");
  res.json(programs);
};

exports.updateProgram = async (req, res) => {
  const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(program);
};

exports.deleteProgram = async (req, res) => {
  await Program.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ===== SEMESTER =====
exports.createSemester = async (req, res) => {
  const semester = await Semester.create(req.body);
  res.status(201).json(semester);
};

exports.getSemesters = async (_, res) => {
  const semesters = await Semester.find().populate("program");
  res.json(semesters);
};

exports.updateSemester = async (req, res) => {
  const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(semester);
};

exports.deleteSemester = async (req, res) => {
  await Semester.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// // ===== EXAM =====
// exports.createExam = async (req, res) => {
//   const exam = await Exam.create(req.body);
//   res.status(201).json(exam);
// };

exports.getExams = async (_, res) => {
  const exams = await Exam.find().populate("level source program semester");
  res.json(exams);
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const {
      title, type, level, source, program, semester,
      category, examDate, status
    } = req.body;

    // Update fields
    exam.title = title;
    exam.type = type;
    exam.level = level;
    exam.source = source;
    exam.program = program || undefined;
    exam.semester = semester || undefined;
    exam.category = category;
    exam.examDate = examDate;

    // ✅ Safely assign status with default fallback
    if (["upcoming", "ongoing", "completed"].includes(status)) {
      exam.status = status;
    } else {
      exam.status = "upcoming"; // default fallback if empty or invalid
    }

    // Handle image updates
    if (req.files?.officialRoutineImage) {
      if (exam.officialRoutineImage?.public_id) {
        await cloudinary.uploader.destroy(exam.officialRoutineImage.public_id);
      }
      const result = await cloudinary.uploader.upload(req.files.officialRoutineImage[0].path, {
        folder: "exam_routines",
        resource_type: "auto",
      });
      exam.officialRoutineImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    if (req.files?.examNoticeImage) {
      if (exam.examNoticeImage?.public_id) {
        await cloudinary.uploader.destroy(exam.examNoticeImage.public_id);
      }
      const result = await cloudinary.uploader.upload(req.files.examNoticeImage[0].path, {
        folder: "exam_notices",
        resource_type: "auto",
      });
      exam.examNoticeImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await exam.save();
    res.json(exam);
  } catch (err) {
    console.error("Update Exam Error:", err);
    res.status(400).json({ error: err.message });
  }
};



exports.deleteExam = async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ===== EXAM ROUTINE =====

// Create exam routine with file uploads
// exports.createExamRoutine = async (req, res) => {
//   try {
//     const { exam, subject, date, time, venue } = req.body;

//     let officialRoutineImage = null;
//     let examNoticeImage = null;

//     // Upload official routine image
//     if (req.files?.officialRoutine) {
//       const result = await cloudinary.uploader.upload(req.files.officialRoutine.tempFilePath, {
//         folder: "exam_routines",
//         resource_type: "auto", // allows image or PDF
//       });
//       officialRoutineImage = {
//         public_id: result.public_id,
//         url: result.secure_url,
//       };
//     }

//     // Upload exam notice image
//     if (req.files?.examNotice) {
//       const result = await cloudinary.uploader.upload(req.files.examNotice.tempFilePath, {
//         folder: "exam_notices",
//         resource_type: "auto", // allows image or PDF
//       });
//       examNoticeImage = {
//         public_id: result.public_id,
//         url: result.secure_url,
//       };
//     }

//     const routine = await ExamRoutine.create({
//       exam,
//       subject,
//       date,
//       time,
//       venue,
//       officialRoutineImage,
//       examNoticeImage,
//     });

//     res.status(201).json({ success: true, routine });
//   } catch (err) {
//     console.error("Failed to create routine:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.createExamRoutine = async (req, res) => {
  try {
    const { exam, subject, date, time, venue } = req.body;

    let officialRoutineImage = null;
    let examNoticeImage = null;

    // Upload official routine image
    if (req.files?.officialRoutineImage) {
      const result = await cloudinary.uploader.upload(req.files.officialRoutineImage[0].path, {
        folder: "exam_routines",
        resource_type: "auto", // allows image or PDF
      });
      officialRoutineImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Upload exam notice image
    if (req.files?.examNoticeImage) {
      const result = await cloudinary.uploader.upload(req.files.examNoticeImage[0].path, {
        folder: "exam_notices",
        resource_type: "auto", // allows image or PDF
      });
      examNoticeImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const routine = await ExamRoutine.create({
      exam,
      subject,
      date,
      time,
      venue,
      officialRoutineImage,
      examNoticeImage,
    });

    res.status(201).json({ success: true, routine });
  } catch (err) {
    console.error("Failed to create routine:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all routines
exports.getExamRoutines = async (_, res) => {
  const routines = await ExamRoutine.find().populate("exam");
  res.json({ success: true, routines });
};

exports.updateExamRoutine = async (req, res) => {
  try {
    const routine = await ExamRoutine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: "Exam routine not found" });
    }

    // Update fields from req.body
    routine.exam = req.body.exam;
    routine.subject = req.body.subject;
    routine.date = req.body.date;
    routine.time = req.body.time;
    routine.venue = req.body.venue;

    // Handle uploaded files
    if (req.files?.officialRoutineImage) {
      // TODO: Delete old officialRoutineImage from Cloudinary if needed
      const file = req.files.officialRoutineImage[0];
      // Upload file to cloudinary or wherever, then update:
      routine.officialRoutineImage = {
        public_id: file.filename, // or Cloudinary public_id after upload
        url: file.path // or Cloudinary URL after upload
      };
    }

    if (req.files?.examNoticeImage) {
      // TODO: Delete old examNoticeImage from Cloudinary if needed
      const file = req.files.examNoticeImage[0];
      // Upload file to cloudinary or wherever, then update:
      routine.examNoticeImage = {
        public_id: file.filename,
        url: file.path
      };
    }

    await routine.save();

    res.status(200).json({ success: true, routine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// Delete routine
exports.deleteExamRoutine = async (req, res) => {
  await ExamRoutine.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.createExam = async (req, res) => {
  try {
    const {
      title, type, level, source, program, semester,
      category, examDate, status
    } = req.body;

    let officialRoutineImage = null;
    let examNoticeImage = null;

    if (req.files && req.files.officialRoutineImage) {
      const result = await cloudinary.uploader.upload(req.files.officialRoutineImage[0].path, {
        folder: "exam_routines",
        resource_type: "auto",
      });
      officialRoutineImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    if (req.files && req.files.examNoticeImage) {
      const result = await cloudinary.uploader.upload(req.files.examNoticeImage[0].path, {
        folder: "exam_notices",
        resource_type: "auto",
      });
      examNoticeImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const exam = await Exam.create({
      title,
      type,
      level,
      source,
      program: program || undefined,
      semester: semester || undefined,
      category,
      examDate,
      status,
      officialRoutineImage,
      examNoticeImage,
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error("Create Exam Error:", err);
    res.status(400).json({ error: err.message });
  }
};
