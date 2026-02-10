import express from "express";
import {
  createSuggestion,
  listSuggestions,
} from "../controllers/courseSuggestionController.js";

const router = express.Router();

// Course suggestion routes (public).
router.get("/coursesuggestions", listSuggestions);
router.post("/coursesuggestions", createSuggestion);

export default router;
