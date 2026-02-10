import mongoose from "mongoose";

// Uploaded documents associated with a revision module.
const moduleDocumentSchema = new mongoose.Schema(
  {
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: "RevisionModule", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("ModuleDocument", moduleDocumentSchema);
