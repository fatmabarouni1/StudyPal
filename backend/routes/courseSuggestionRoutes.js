const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSuggestion,
  listSuggestions,
} = require("../controllers/courseSuggestionController");

const router = express.Router();

// Course suggestion routes (protected).
router.post("/", authMiddleware, createSuggestion);
router.get("/", authMiddleware, listSuggestions);

module.exports = router;
