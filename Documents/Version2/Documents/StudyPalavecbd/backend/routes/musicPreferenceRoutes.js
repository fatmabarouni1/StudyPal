import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  setPreference,
  getPreference,
} from "../controllers/musicPreferenceController.js";

const router = express.Router();

// Music preference routes (protected).
router.put("/", authMiddleware, setPreference);
router.get("/", authMiddleware, getPreference);

export default router;
