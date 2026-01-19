const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSession,
  joinSession,
  leaveSession,
} = require("../controllers/studySessionController");

const router = express.Router();

// Study session routes (protected).
router.post("/", authMiddleware, createSession);
router.post("/:sessionId/join", authMiddleware, joinSession);
router.post("/:sessionId/leave", authMiddleware, leaveSession);

module.exports = router;
