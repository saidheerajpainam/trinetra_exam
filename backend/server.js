import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   ✅ MYSQL CONNECTION
================================ */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // change if needed
  database: "examportal",
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ===============================
   ✅ TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("🚀 Backend Running");
});

/* ===============================
   ✅ REGISTER API
================================ */
app.post("/api/register", (req, res) => {
  const {
    name,
    email,
    mobile,
    password,
    idType,
    collegeId,
    userId,
    hallTicket,
  } = req.body;

  const sql = `
    INSERT INTO USERS 
    (NAME, EMAIL, MOBILE, PASSWORD, ID_TYPE, COLLEGE_ID, USER_ID, HALL_TICKET)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, email, mobile, password, idType, collegeId, userId, hallTicket],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error inserting user" });
      }
      res.json({ message: "✅ User Registered Successfully" });
    }
  );
});

/* ===============================
   ✅ LOGIN API
================================ */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM USERS WHERE EMAIL = ? AND PASSWORD = ?";

  db.query(sql, [email, password], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      res.json({ message: "✅ Login success", user: data[0] });
    } else {
      res.status(401).json({ message: "❌ Invalid credentials" });
    }
  });
});

/* ===============================
   ✅ QUESTIONS API (IMPORTANT)
================================ */
app.get("/api/questions/:type", (req, res) => {
  const type = req.params.type.toUpperCase();

  db.query(
    "SELECT * FROM QUESTIONS WHERE TYPE = ?",
    [type],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const formatted = result.map((q) => ({
        id: q.ID,
        text: `[${q.TYPE}] ${q.QUESTION}`,
        options: [
          { id: "a", text: q.OPTION_A },
          { id: "b", text: q.OPTION_B },
          { id: "c", text: q.OPTION_C },
          { id: "d", text: q.OPTION_D },
        ],
        correct_answer: q.CORRECT_ANSWER,
      }));

      res.json(formatted);
    }
  );
});

/* ===============================
   🚀 START SERVER (FIXED PORT)
================================ */
const PORT = 5001; // 🔥 CHANGED FROM 5000 → 5001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});