import CourseSuggestion from "../models/CourseSuggestion.js";

// Create a course suggestion.
const createSuggestion = async (req, res) => {
  try {
    const { title, description, level } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const suggestion = await CourseSuggestion.create({
      title: title.trim(),
      description: description?.trim() || "",
      level: level?.trim() || "",
    });

    return res.status(201).json(suggestion);
  } catch (error) {
    console.error("Failed to create course suggestion:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// List all course suggestions.
const listSuggestions = async (req, res) => {
  try {
    const suggestions = await CourseSuggestion.find().sort({ createdAt: -1 });
    return res.json(suggestions);
  } catch (error) {
    console.error("Failed to list course suggestions:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export { createSuggestion, listSuggestions };
