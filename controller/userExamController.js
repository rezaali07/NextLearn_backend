const Level = require("../models/Level");
const ExamSource = require("../models/ExamSource");
const Program = require("../models/Program");
const Semester = require("../models/Semester");
const Exam = require("../models/Exam");
const ExamRoutine = require("../models/ExamRoutine");

// Get all levels (10, 11, 12, Bachelor)
exports.getLevels = async (_, res) => {
  const levels = await Level.find();
  res.json(levels);
};

// Get all sources (TU, KU, NEB, Lok Sewa)
exports.getExamSources = async (_, res) => {
  const sources = await ExamSource.find();
  res.json(sources);
};

// Get all programs (BBA, CSIT, Nursing, etc.)
exports.getPrograms = async (_, res) => {
  const programs = await Program.find().populate("source level");
  res.json(programs);
};

// Get all semesters for selected program
exports.getSemesters = async (_, res) => {
  const semesters = await Semester.find().populate("program");
  res.json(semesters);
};

// Get exams with filter support
exports.getExams = async (req, res) => {
  const { level, source, program, semester } = req.query;
  const query = {};
  if (level) query.level = level;
  if (source) query.source = source;
  if (program) query.program = program;
  if (semester) query.semester = semester;

  const exams = await Exam.find(query).populate("level source program semester");
  res.json(exams);
};

// // Get all routines for a specific exam
// exports.getExamRoutines = async (req, res) => {
//   const routines = await ExamRoutine.find({ exam: req.params.id }).populate("exam");
//   res.json(routines);
// };


// Get all routines
exports.getExamRoutines = async (_, res) => {
  const routines = await ExamRoutine.find().populate("exam");
  res.json({ success: true, routines });
};