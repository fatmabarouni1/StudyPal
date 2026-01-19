const mongoose = require("mongoose");

// Stores AI or admin course suggestions.
const courseSuggestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    platform: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, required: true },
    added_by_ai: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("CourseSuggestion", courseSuggestionSchema);
