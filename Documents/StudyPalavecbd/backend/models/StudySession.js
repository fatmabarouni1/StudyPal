const mongoose = require("mongoose");

// Represents a study session (solo or group).
const studySessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["solo", "group"], required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    is_active: { type: Boolean, default: true },
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date, default: null },
  },
  { versionKey: false }
);

module.exports = mongoose.model("StudySession", studySessionSchema);
