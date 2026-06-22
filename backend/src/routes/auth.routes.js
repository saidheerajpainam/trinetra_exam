import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

function cleanUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    college: user.college,
    course: user.course,
    role: user.role,
  };
}

// 1. Student Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, college, course, password } = req.body;

    if (!name || !email || !mobile || !college || !course || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const safeEmail = String(email).trim().toLowerCase();
    const safeMobile = String(mobile).trim();

    // Check if user already exists
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: safeEmail },
          { mobile: safeMobile }
        ]
      }
    });

    if (exists) {
      return res.status(409).json({ message: "Email or mobile number is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: safeEmail,
        mobile: safeMobile,
        college: college.trim(),
        course: course.trim(),
        password: passwordHash,
        role: "STUDENT"
      }
    });

    const token = createToken(newUser);

    res.status(201).json({ token, user: cleanUser(newUser) });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// 2. Student Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() }
    });

    if (!user || user.role !== "STUDENT") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);
    res.json({ token, user: cleanUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// 3. Admin Login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body; // username is the email (e.g. admin@trinetra.com)
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(username).trim().toLowerCase() }
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = createToken(user);
    res.json({ token, user: cleanUser(user) });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Admin login failed" });
  }
});

export default router;
