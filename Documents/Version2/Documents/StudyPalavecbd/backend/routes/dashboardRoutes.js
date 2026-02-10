import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getDashboard, updateTargets, useFreezeToken } from "../controllers/dashboardController.js";

const router = express.Router();

// Dashboard data (protected).
router.get("/", authMiddleware, getDashboard);
router.patch("/targets", authMiddleware, updateTargets);
router.post("/streaks/freeze", authMiddleware, useFreezeToken);

export default router;
