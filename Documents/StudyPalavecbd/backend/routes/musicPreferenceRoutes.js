const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  setPreference,
  getPreference,
} = require("../controllers/musicPreferenceController");

const router = express.Router();

// Music preference routes (protected).
router.put("/", authMiddleware, setPreference);
router.get("/", authMiddleware, getPreference);

module.exports = router;
