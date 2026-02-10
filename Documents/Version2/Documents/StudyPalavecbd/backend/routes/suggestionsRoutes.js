import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  listSuggestions,
  createSuggestion,
  deleteSuggestion,
} from "../controllers/suggestionsController.js";

const router = express.Router();

router.get("/", authMiddleware, listSuggestions);
router.post("/", authMiddleware, createSuggestion);
router.delete("/:id", authMiddleware, deleteSuggestion);

export default router;
