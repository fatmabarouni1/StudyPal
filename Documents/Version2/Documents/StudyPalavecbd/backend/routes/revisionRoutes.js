import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
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
} from "../controllers/revisionController.js";

ensureUploadsDir();

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/modules", authMiddleware, listModules);
router.post("/modules", authMiddleware, createModule);
router.get("/modules/:moduleId", authMiddleware, getModule);
router.patch("/modules/:moduleId", authMiddleware, updateModule);
router.delete("/modules/:moduleId", authMiddleware, deleteModule);

router.get("/modules/:moduleId/documents", authMiddleware, listDocuments);
router.post(
  "/modules/:moduleId/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);
router.delete("/documents/:documentId", authMiddleware, deleteDocument);

router.get("/modules/:moduleId/notes", authMiddleware, getNote);
router.put("/modules/:moduleId/notes", authMiddleware, saveNote);

router.get("/modules/:moduleId/links", authMiddleware, listLinks);
router.post("/modules/:moduleId/links", authMiddleware, createLink);
router.delete("/links/:linkId", authMiddleware, deleteLink);

export default router;
