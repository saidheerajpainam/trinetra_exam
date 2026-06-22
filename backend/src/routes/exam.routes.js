import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// 1. Get available exams and their status for the logged-in user
router.get("/exams", authRequired, async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { id: "asc" }
    });

    const results = await prisma.result.findMany({
      where: { userId: req.user.id }
    });

    // Map completion status
    const examList = exams.map((exam) => {
      const result = results.find((r) => r.subject.toLowerCase() === exam.subject.toLowerCase());
      return {
        id: exam.id,
        subject: exam.subject,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        status: result ? "completed" : "not_started",
        score: result ? result.score : null,
        percentage: result ? result.percentage : null,
        passed: result ? result.passed : null,
      };
    });

    res.json(examList);
  } catch (error) {
    console.error("Error loading exams:", error);
    res.status(500).json({ message: "Failed to load exams" });
  }
});

// 2. Get random questions for an exam
// Supports /api/questions/random?subject=drones%20exam or /api/questions/random/:examId
router.get("/questions/random", authRequired, async (req, res) => {
  try {
    const subject = req.query.subject;
    if (!subject) {
      return res.status(400).json({ message: "Subject query parameter is required" });
    }

    const exam = await prisma.exam.findUnique({
      where: { subject: String(subject) },
      include: { questions: true }
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Shuffle questions array and slice totalQuestions limit
    const shuffled = [...exam.questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, exam.totalQuestions);

    res.json({
      examId: exam.id,
      subject: exam.subject,
      duration: exam.duration,
      questions: selectedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        difficulty: q.difficulty,
        questionType: q.questionType
      }))
    });
  } catch (error) {
    console.error("Error loading random questions:", error);
    res.status(500).json({ message: "Failed to load questions" });
  }
});

// 3. Submit Exam
router.post("/exam/submit", authRequired, async (req, res) => {
  try {
    const { subject, answers, isMalpractice } = req.body; // answers is object { [questionId]: "A" | "B" | "C" | "D" }

    if (!subject || !answers) {
      return res.status(400).json({ message: "Subject and answers are required" });
    }

    const exam = await prisma.exam.findUnique({
      where: { subject: String(subject) },
      include: { questions: true }
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Double check if user already has a result for this subject
    const alreadyDone = await prisma.result.findFirst({
      where: {
        userId: req.user.id,
        subject: exam.subject
      }
    });

    if (alreadyDone) {
      return res.status(400).json({ message: "You have already completed this exam" });
    }

    let score = 0;
    const questions = exam.questions;

    // We grade the answers if it's not malpractice
    if (!isMalpractice) {
      questions.forEach((q) => {
        const studentAns = answers[q.id];
        if (studentAns && String(studentAns).toUpperCase() === String(q.correctAnswer).toUpperCase()) {
          score++;
        }
      });
    }

    const totalQuestions = exam.totalQuestions;
    const percentage = isMalpractice ? 0 : Math.round((score / totalQuestions) * 100);
    const passed = !isMalpractice && percentage >= 40;

    // Save result
    const result = await prisma.result.create({
      data: {
        userId: req.user.id,
        subject: exam.subject,
        score,
        percentage,
        passed,
        isMalpractice: !!isMalpractice
      }
    });

    // If passed, generate certificate
    let certificate = null;
    if (passed) {
      const certificateNo = `TRI-CERT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      certificate = await prisma.certificate.create({
        data: {
          userId: req.user.id,
          certificateNo,
          subject: exam.subject
        }
      });
    }

    res.status(201).json({
      resultId: result.id,
      score,
      percentage,
      passed,
      certificateNo: certificate ? certificate.certificateNo : null,
      questions: exam.questions.map((q) => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer
      }))
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ message: "Failed to submit exam" });
  }
});

// 4. Get results for current student, or if admin get all results
router.get("/results", authRequired, async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const allResults = await prisma.result.findMany({
        include: {
          user: {
            select: { name: true, email: true, mobile: true, college: true }
          }
        },
        orderBy: { date: "desc" }
      });
      return res.json(allResults);
    }

    const studentResults = await prisma.result.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" }
    });
    res.json(studentResults);
  } catch (error) {
    console.error("Error loading results:", error);
    res.status(500).json({ message: "Failed to load results" });
  }
});

// 4b. Get review details (questions and correct answers) for a specific result ID
router.get("/results/:id/review", authRequired, async (req, res) => {
  try {
    const result = await prisma.result.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Verify ownership: must be the student who took it, or an admin
    if (result.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find the exam questions for the subject
    const exam = await prisma.exam.findUnique({
      where: { subject: result.subject },
      include: { questions: true }
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam details not found" });
    }

    // Return questions with correct answers
    res.json({
      resultId: result.id,
      subject: result.subject,
      questions: exam.questions.map((q) => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer
      }))
    });
  } catch (error) {
    console.error("Error loading exam review:", error);
    res.status(500).json({ message: "Failed to load review details" });
  }
});

// 5. Get announcements
router.get("/announcements", authRequired, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" }
    });
    res.json(announcements);
  } catch (error) {
    console.error("Error loading announcements:", error);
    res.status(500).json({ message: "Failed to load announcements" });
  }
});

// 7. Get certificates for current student
router.get("/certificates", authRequired, async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" }
    });
    res.json(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
    res.status(500).json({ message: "Failed to load certificates" });
  }
});

// 8. Get specific certificate by ID/no
router.get("/certificate/:id", authRequired, async (req, res) => {
  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: isNaN(Number(req.params.id)) ? -1 : Number(req.params.id) },
          { certificateNo: req.params.id }
        ]
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Security: standard user can only access their own certificates
    if (req.user.role !== "ADMIN" && cert.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Load score
    const result = await prisma.result.findFirst({
      where: {
        userId: cert.userId,
        subject: cert.subject
      }
    });

    res.json({
      ...cert,
      score: result ? result.score : null,
      percentage: result ? result.percentage : null
    });
  } catch (error) {
    console.error("Error loading certificate:", error);
    res.status(500).json({ message: "Failed to load certificate" });
  }
});

// 9. Get profile details
router.get("/profile", authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Exclude password
    const { password, ...profile } = user;
    res.json(profile);
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

// 10. Update profile or Change Password
router.put("/profile", authRequired, async (req, res) => {
  try {
    const { name, mobile, college, course, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (mobile) updateData.mobile = String(mobile).trim();
    if (college) updateData.college = college.trim();
    if (course) updateData.course = course.trim();

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const { password: _, ...profile } = updatedUser;
    res.json({ message: "Profile updated successfully", user: profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
