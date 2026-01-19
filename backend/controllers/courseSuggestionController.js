const CourseSuggestion = require("../models/CourseSuggestion");

// Create a course suggestion (AI/admin).
const createSuggestion = async (req, res) => {
  const { title, platform, url, category, added_by_ai } = req.body;

  if (!title || !platform || !url || !category) {
    return res.status(400).json({ message: "Title, platform, URL, and category are required." });
  }

  const suggestion = await CourseSuggestion.create({
    title,
    platform,
    url,
    category,
    added_by_ai: Boolean(added_by_ai),
  });

  return res.status(201).json({ message: "Course suggestion added.", suggestion });
};

// List all course suggestions.
const listSuggestions = async (req, res) => {
  const suggestions = await CourseSuggestion.find().sort({ created_at: -1 });
  return res.json({ suggestions });
};

module.exports = { createSuggestion, listSuggestions };
