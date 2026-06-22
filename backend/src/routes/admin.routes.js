import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../db.js";
import { adminRequired } from "../middleware/auth.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ==========================================
// 1. ADMIN DASHBOARD STATS
// ==========================================
router.get("/admin/stats", adminRequired, async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    const totalExams = await prisma.exam.count();
    const totalQuestions = await prisma.question.count();
    const totalResults = await prisma.result.count();

    // Chart 1: Exam Performance (average score and total attempts per subject)
    const resultsBySubject = await prisma.result.groupBy({
      by: ["subject"],
      _avg: {
        percentage: true
      },
      _count: {
        id: true
      }
    });

    const examPerformance = resultsBySubject.map((item) => ({
      subject: item.subject,
      avgScore: Math.round(item._avg.percentage || 0),
      attempts: item._count.id
    }));

    // Chart 2: Student Statistics (distribution of students by course)
    const studentsByCourse = await prisma.user.groupBy({
      by: ["course"],
      where: { role: "STUDENT" },
      _count: {
        id: true
      }
    });

    const studentStatistics = studentsByCourse.map((item) => ({
      course: item.course,
      count: item._count.id
    }));

    res.json({
      totalStudents,
      totalExams,
      totalQuestions,
      totalResults,
      charts: {
        examPerformance,
        studentStatistics
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

// ==========================================
// 2. MANAGE EXAMS
// ==========================================

// Add Exam
router.post("/exams", adminRequired, async (req, res) => {
  try {
    const { subject, duration, totalQuestions } = req.body;
    if (!subject || !duration) {
      return res.status(400).json({ message: "Subject and duration are required" });
    }

    const exam = await prisma.exam.create({
      data: {
        subject: String(subject).trim(),
        duration: Number(duration),
        totalQuestions: totalQuestions ? Number(totalQuestions) : 10
      }
    });
    res.status(201).json(exam);
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ message: "Failed to create exam. Subject might already exist." });
  }
});

// Edit Exam
router.put("/exams/:id", adminRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, duration, totalQuestions } = req.body;

    const exam = await prisma.exam.update({
      where: { id: Number(id) },
      data: {
        subject: subject ? String(subject).trim() : undefined,
        duration: duration ? Number(duration) : undefined,
        totalQuestions: totalQuestions ? Number(totalQuestions) : undefined
      }
    });
    res.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: "Failed to update exam" });
  }
});

// Delete Exam
router.delete("/exams/:id", adminRequired, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exam.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: "Failed to delete exam" });
  }
});

// ==========================================
// 3. MANAGE QUESTIONS
// ==========================================

// List all questions (support filtering by examId/subject)
router.get("/questions", adminRequired, async (req, res) => {
  try {
    const { examId, search } = req.query;
    const where = {};
    if (examId) where.examId = Number(examId);
    if (search) {
      where.OR = [
        { question: { contains: String(search), mode: "insensitive" } },
        { subject: { contains: String(search), mode: "insensitive" } }
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        exam: {
          select: { subject: true }
        }
      }
    });
    res.json(questions);
  } catch (error) {
    console.error("Error loading questions:", error);
    res.status(500).json({ message: "Failed to load questions" });
  }
});

// Bulk Add Questions
router.post("/questions/bulk", adminRequired, async (req, res) => {
  try {
    const { examId, questions } = req.body;

    if (!examId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Exam ID and questions array are required" });
    }

    const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const formattedData = questions.map((q) => ({
      examId: Number(examId),
      subject: exam.subject,
      question: String(q.question).trim(),
      optionA: String(q.optionA).trim(),
      optionB: String(q.optionB).trim(),
      optionC: String(q.optionC).trim(),
      optionD: String(q.optionD).trim(),
      correctAnswer: String(q.correctAnswer).trim().toUpperCase(),
      difficulty: q.difficulty ? String(q.difficulty).trim() : "Medium",
      questionType: q.questionType ? String(q.questionType).trim() : "MCQ",
    }));

    const result = await prisma.question.createMany({
      data: formattedData,
    });

    res.status(201).json({ message: `Successfully imported ${result.count} questions`, count: result.count });
  } catch (error) {
    console.error("Error bulk creating questions:", error);
    res.status(500).json({ message: "Failed to bulk import questions" });
  }
});

// Add Question
router.post("/questions", adminRequired, async (req, res) => {
  try {
    const { examId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, questionType } = req.body;

    if (!examId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ message: "All question fields are required" });
    }

    const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const newQuestion = await prisma.question.create({
      data: {
        examId: Number(examId),
        subject: exam.subject,
        question: String(question).trim(),
        optionA: String(optionA).trim(),
        optionB: String(optionB).trim(),
        optionC: String(optionC).trim(),
        optionD: String(optionD).trim(),
        correctAnswer: String(correctAnswer).trim().toUpperCase(),
        difficulty: difficulty ? String(difficulty).trim() : "Medium",
        questionType: questionType ? String(questionType).trim() : "MCQ"
      }
    });
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Failed to add question" });
  }
});

// Edit Question (supports both /api/questions/:id and /api/questions body id)
router.put("/questions/:id", adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { examId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, questionType } = req.body;

    const data = {};
    if (examId) {
      const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
      if (exam) {
        data.examId = Number(examId);
        data.subject = exam.subject;
      }
    }
    if (question) data.question = String(question).trim();
    if (optionA) data.optionA = String(optionA).trim();
    if (optionB) data.optionB = String(optionB).trim();
    if (optionC) data.optionC = String(optionC).trim();
    if (optionD) data.optionD = String(optionD).trim();
    if (correctAnswer) data.correctAnswer = String(correctAnswer).trim().toUpperCase();
    if (difficulty) data.difficulty = String(difficulty).trim();
    if (questionType) data.questionType = String(questionType).trim();

    const updated = await prisma.question.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
});

// Delete Question
router.delete("/questions/:id", adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.question.delete({
      where: { id }
    });
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
});

// ==========================================
// 4. MANAGE STUDENTS
// ==========================================

// List Students
router.get("/students", adminRequired, async (req, res) => {
  try {
    const { search } = req.query;
    const where = { role: "STUDENT" };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
        { college: { contains: String(search), mode: "insensitive" } }
      ];
    }

    const students = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        college: true,
        course: true,
        createdAt: true,
        results: true
      }
    });
    res.json(students);
  } catch (error) {
    console.error("Error loading students:", error);
    res.status(500).json({ message: "Failed to load students" });
  }
});

// Delete Student
router.delete("/students/:id", adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// ==========================================
// 5. ANNOUNCEMENTS
// ==========================================

// Create Announcement
router.post("/announcements", adminRequired, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim()
      }
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

// Delete Announcement
router.delete("/announcements/:id", adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.announcement.delete({ where: { id } });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

export default router;
