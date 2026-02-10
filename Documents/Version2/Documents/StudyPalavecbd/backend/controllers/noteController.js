import Note from "../models/Note.js";

// Create a personal or AI-generated note.
const createNote = async (req, res) => {
  const { title, content, ai_generated } = req.body;

  if (content === undefined || content === null) {
    return res.status(400).json({ message: "Content is required." });
  }

  const note = await Note.create({
    title: title?.trim() || "Untitled Note",
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

// Update an existing note for the logged-in user.
const updateNote = async (req, res) => {
  const { title, content, ai_generated } = req.body;
  const updates = {};

  if (title !== undefined) {
    updates.title = title?.trim() || "Untitled Note";
  }
  if (content !== undefined) {
    updates.content = content;
  }
  if (ai_generated !== undefined) {
    updates.ai_generated = Boolean(ai_generated);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No updates provided." });
  }

  const note = await Note.findOneAndUpdate(
    { _id: req.params.noteId, user_id: req.user.id },
    updates,
    { new: true }
  );

  if (!note) {
    return res.status(404).json({ message: "Note not found." });
  }

  return res.json({ message: "Note updated.", note });
};

// Delete a note for the logged-in user.
const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.noteId,
    user_id: req.user.id,
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found." });
  }

  return res.json({ message: "Note deleted." });
};

export { createNote, listNotes, updateNote, deleteNote };
