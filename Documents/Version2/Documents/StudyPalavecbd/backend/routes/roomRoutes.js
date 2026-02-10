import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createRoom,
  listRooms,
  getRoom,
  joinRoom,
  leaveRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.get("/", authMiddleware, listRooms);
router.get("/:roomId", authMiddleware, getRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);
router.post("/:roomId/leave", authMiddleware, leaveRoom);

export default router;
