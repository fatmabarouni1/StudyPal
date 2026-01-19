const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

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

  // Fake credentials for now
  if (email === "test@test.com" && password === "1234") {
    return res.json({
      message: "Login successful",
      token: "fake-jwt-token",
    });
  }

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
