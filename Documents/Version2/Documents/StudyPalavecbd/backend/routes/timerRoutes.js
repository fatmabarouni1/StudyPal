import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createTimer, listTimers } from "../controllers/timerController.js";

const router = express.Router();

// Timer routes (protected).
router.post("/", authMiddleware, createTimer);
router.get("/", authMiddleware, listTimers);

export default router;
