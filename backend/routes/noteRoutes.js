const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createNote, listNotes } = require("../controllers/noteController");

const router = express.Router();

// Note routes (protected).
router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, listNotes);

module.exports = router;
