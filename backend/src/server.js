import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import examRoutes from "./routes/exam.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Approve any local development origin (localhost or 127.0.0.1 on any port) dynamically
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin === "http://localhost" || origin === "http://127.0.0.1") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[Backend Request] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('[Backend Request Body]', JSON.stringify(req.body));
  }
  next();
});

// Serve static uploads
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => {
  res.json({ message: "Trinetra Exam Backend API is running" });
});

app.get("/api", (_req, res) => {
  res.json({ message: "Trinetra Exam Backend API is running. Access sub-routes like /api/auth or /api/exams." });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api", examRoutes);
app.use("/api", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
