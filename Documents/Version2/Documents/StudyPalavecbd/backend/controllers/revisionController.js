import fs from "fs";
import path from "path";
import RevisionModule from "../models/RevisionModule.js";
import ModuleDocument from "../models/ModuleDocument.js";
import ModuleNote from "../models/ModuleNote.js";
import ModuleLink from "../models/ModuleLink.js";

const ensureUploadsDir = () => {
  const uploadDir = path.resolve("uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Modules
const listModules = async (req, res) => {
  const modules = await RevisionModule.find({ user_id: req.user.id }).sort({ updated_at: -1 });
  return res.json({ modules });
};

const createModule = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  const module = await RevisionModule.create({
    user_id: req.user.id,
    title: title.trim(),
    description: description?.trim() || "",
  });

  return res.status(201).json({ message: "Module created.", module });
};

const getModule = async (req, res) => {
  const module = await RevisionModule.findOne({
    _id: req.params.moduleId,
    user_id: req.user.id,
  });

  if (!module) {
    return res.status(404).json({ message: "Module not found." });
  }

  return res.json({ module });
};

const updateModule = async (req, res) => {
  const { title, description } = req.body;
  const updates = {};

  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  updates.updated_at = new Date();

  const module = await RevisionModule.findOneAndUpdate(
    { _id: req.params.moduleId, user_id: req.user.id },
    updates,
    { new: true }
  );

  if (!module) {
    return res.status(404).json({ message: "Module not found." });
  }

  return res.json({ message: "Module updated.", module });
};

const deleteModule = async (req, res) => {
  const module = await RevisionModule.findOneAndDelete({
    _id: req.params.moduleId,
    user_id: req.user.id,
  });

  if (!module) {
    return res.status(404).json({ message: "Module not found." });
  }

  await ModuleDocument.deleteMany({ module_id: module._id, user_id: req.user.id });
  await ModuleNote.deleteMany({ module_id: module._id, user_id: req.user.id });
  await ModuleLink.deleteMany({ module_id: module._id, user_id: req.user.id });

  return res.json({ message: "Module deleted." });
};

// Documents
const listDocuments = async (req, res) => {
  const documents = await ModuleDocument.find({
    module_id: req.params.moduleId,
    user_id: req.user.id,
  })
    .sort({ uploadedAt: -1 })
    .lean();

  const normalized = documents.map((doc) => ({
    ...doc,
    originalName: doc.originalName ?? doc.original_name,
    uploadedAt: doc.uploadedAt ?? doc.created_at,
  }));

  return res.json({ documents: normalized });
};

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required." });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const document = await ModuleDocument.create({
    module_id: req.params.moduleId,
    user_id: req.user.id,
    originalName: req.file.originalname,
    filename: req.file.filename,
    mime_type: req.file.mimetype,
    size: req.file.size,
    url: `${baseUrl}/uploads/${req.file.filename}`,
    uploadedAt: new Date(),
  });

  await RevisionModule.updateOne(
    { _id: req.params.moduleId, user_id: req.user.id },
    { updated_at: new Date() }
  );

  return res.status(201).json({ message: "Document uploaded.", document });
};

const deleteDocument = async (req, res) => {
  const document = await ModuleDocument.findOneAndDelete({
    _id: req.params.documentId,
    user_id: req.user.id,
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found." });
  }

  await RevisionModule.updateOne(
    { _id: document.module_id, user_id: req.user.id },
    { updated_at: new Date() }
  );

  return res.json({ message: "Document deleted." });
};

// Notes
const getNote = async (req, res) => {
  const note = await ModuleNote.findOne({
    module_id: req.params.moduleId,
    user_id: req.user.id,
  });

  return res.json({ note });
};

const saveNote = async (req, res) => {
  const { content } = req.body;

  const note = await ModuleNote.findOneAndUpdate(
    { module_id: req.params.moduleId, user_id: req.user.id },
    { content: content ?? "", updated_at: new Date() },
    { new: true, upsert: true }
  );

  await RevisionModule.updateOne(
    { _id: req.params.moduleId, user_id: req.user.id },
    { updated_at: new Date() }
  );

  return res.json({ message: "Note saved.", note });
};

// Links
const listLinks = async (req, res) => {
  const links = await ModuleLink.find({
    module_id: req.params.moduleId,
    user_id: req.user.id,
  }).sort({ created_at: -1 });
  return res.json({ links });
};

const createLink = async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: "Title and url are required." });
  }

  const link = await ModuleLink.create({
    module_id: req.params.moduleId,
    user_id: req.user.id,
    title: title.trim(),
    url: url.trim(),
  });

  await RevisionModule.updateOne(
    { _id: req.params.moduleId, user_id: req.user.id },
    { updated_at: new Date() }
  );

  return res.status(201).json({ message: "Link added.", link });
};

const deleteLink = async (req, res) => {
  const link = await ModuleLink.findOneAndDelete({
    _id: req.params.linkId,
    user_id: req.user.id,
  });

  if (!link) {
    return res.status(404).json({ message: "Link not found." });
  }

  await RevisionModule.updateOne(
    { _id: link.module_id, user_id: req.user.id },
    { updated_at: new Date() }
  );

  return res.json({ message: "Link deleted." });
};

export {
  ensureUploadsDir,
  listModules,
  createModule,
  getModule,
  updateModule,
  deleteModule,
  listDocuments,
  uploadDocument,
  deleteDocument,
  getNote,
  saveNote,
  listLinks,
  createLink,
  deleteLink,
};
