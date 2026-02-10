import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.js";

const router = express.Router();

// Custom goal routes (protected).
router.get("/", authMiddleware, listGoals);
router.post("/", authMiddleware, createGoal);
router.patch("/:goalId", authMiddleware, updateGoal);
router.delete("/:goalId", authMiddleware, deleteGoal);

export default router;
