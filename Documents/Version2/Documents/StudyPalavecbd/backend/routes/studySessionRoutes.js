import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createSession,
  joinSession,
  leaveSession,
  completeSession,
} from "../controllers/studySessionController.js";

const router = express.Router();

// Study session routes (protected).
router.post("/", authMiddleware, createSession);
router.post("/complete", authMiddleware, completeSession);
router.post("/:sessionId/join", authMiddleware, joinSession);
router.post("/:sessionId/leave", authMiddleware, leaveSession);

export default router;
