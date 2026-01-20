const mongoose = require("mongoose");

// Personal or AI-generated notes for a user.
const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    ai_generated: { type: Boolean, default: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Note", noteSchema);
