import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import studySessionRoutes from "./routes/studySessionRoutes.js";
import timerRoutes from "./routes/timerRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import musicPreferenceRoutes from "./routes/musicPreferenceRoutes.js";
import courseSuggestionRoutes from "./routes/courseSuggestion.routes.js";
import goalRoutes from "./routes/goalRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import revisionRoutes from "./routes/revisionRoutes.js";
import suggestionsRoutes from "./routes/suggestionsRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import moduleAiRoutes from "./routes/moduleAiRoutes.js";
import securityLogger from "./middleware/securityLogger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// =======================
// Middlewares
// =======================
app.use(
  cors({
    origin: clientOrigins,
  })
);
app.use(express.json());
app.use(securityLogger);
app.use("/uploads", express.static("uploads"));

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
app.use("/api/goals", goalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/music", musicPreferenceRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api", courseSuggestionRoutes);
app.use("/api", moduleAiRoutes);
app.use("/api/rooms", roomRoutes);

// =======================
// Server & Database
// =======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
