const Note = require("../models/Note");

// Create a personal or AI-generated note.
const createNote = async (req, res) => {
  const { content, ai_generated } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  const note = await Note.create({
    content,
    ai_generated: Boolean(ai_generated),
    user_id: req.user.id,
  });

  return res.status(201).json({ message: "Note created.", note });
};

// List notes for the logged-in user.
const listNotes = async (req, res) => {
  const notes = await Note.find({ user_id: req.user.id }).sort({ created_at: -1 });
  return res.json({ notes });
};

module.exports = { createNote, listNotes };
