const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createTimer, listTimers } = require("../controllers/timerController");

const router = express.Router();

// Timer routes (protected).
router.post("/", authMiddleware, createTimer);
router.get("/", authMiddleware, listTimers);

module.exports = router;
