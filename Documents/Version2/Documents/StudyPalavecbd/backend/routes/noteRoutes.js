import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createNote,
  listNotes,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

// Note routes (protected).
router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, listNotes);
router.patch("/:noteId", authMiddleware, updateNote);
router.delete("/:noteId", authMiddleware, deleteNote);

export default router;
