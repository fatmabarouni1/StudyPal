const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const app = express();
const PORT = 5000;

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-change-me-in-env";
const TOKEN_EXPIRY = "2h";

const users = new Map();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());

// =======================
// Routes
// =======================

// Test route
app.get("/", (req, res) => {
  res.send("Backend Studypal is running 🚀");
});

// Register route
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (users.has(email)) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  users.set(email, { email, passwordHash });

  res.json({
    message: "User registered successfully",
    user: {
      email,
    },
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign({ email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  return res.json({
    message: "Login successful",
    token,
  });

  res.status(401).json({
    message: "Invalid credentials",
  });
});

// =======================
// Server
// =======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
