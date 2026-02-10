import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

// Calendar event routes (protected).
router.get("/", authMiddleware, listEvents);
router.post("/", authMiddleware, createEvent);
router.patch("/:eventId", authMiddleware, updateEvent);
router.delete("/:eventId", authMiddleware, deleteEvent);

export default router;
