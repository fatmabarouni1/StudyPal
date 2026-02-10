import Suggestion from "../models/Suggestion.js";

const listSuggestions = async (req, res) => {
  const { moduleId } = req.query;
  const filter = { userId: req.user.id };
  if (moduleId) {
    filter.moduleId = moduleId;
  }

  const suggestions = await Suggestion.find(filter).sort({ createdAt: -1 });
  return res.json({ suggestions });
};

const createSuggestion = async (req, res) => {
  const { title, description, level, moduleId, source } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }

  const suggestion = await Suggestion.create({
    userId: req.user.id,
    moduleId: moduleId || null,
    title: title.trim(),
    description: description?.trim() || "",
    level: level?.trim() || "",
    source: source === "ai" ? "ai" : "manual",
  });

  return res.status(201).json({ suggestion });
};

const deleteSuggestion = async (req, res) => {
  const suggestion = await Suggestion.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!suggestion) {
    return res.status(404).json({ message: "Suggestion not found." });
  }

  return res.json({ message: "Suggestion deleted." });
};

export { listSuggestions, createSuggestion, deleteSuggestion };
