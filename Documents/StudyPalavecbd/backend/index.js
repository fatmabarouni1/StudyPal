const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const timerRoutes = require("./routes/timerRoutes");
const noteRoutes = require("./routes/noteRoutes");
const musicPreferenceRoutes = require("./routes/musicPreferenceRoutes");
const courseSuggestionRoutes = require("./routes/courseSuggestionRoutes");
const securityLogger = require("./middleware/securityLogger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middlewares
// =======================
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(securityLogger);

// =======================
// Routes
// =======================
app.get("/", (req, res) => {
  res.send("StudyPal backend is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", studySessionRoutes);
app.use("/api/timers", timerRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/music", musicPreferenceRoutes);
app.use("/api/courses", courseSuggestionRoutes);

// =======================
// Server & Database
// =======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected.");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
