import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  generateResources,
  getLatestResources,
} from "../controllers/moduleAiController.js";

const router = express.Router();

router.get("/modules/:moduleId/ai/resources", authMiddleware, getLatestResources);
router.post("/modules/:moduleId/ai/resources", authMiddleware, generateResources);

export default router;
