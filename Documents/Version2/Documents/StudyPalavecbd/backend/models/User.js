import mongoose from "mongoose";

// Stores user identity and credentials (hashed password).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    streakCount: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    freezeTokens: { type: Number, default: 1, min: 0, max: 2 },
  },
  { versionKey: false }
);

export default mongoose.model("User", userSchema);
