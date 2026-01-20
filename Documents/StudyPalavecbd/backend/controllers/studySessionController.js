const StudySession = require("../models/StudySession");
const SessionParticipant = require("../models/SessionParticipant");

// Create a new study session (solo or group).
const createSession = async (req, res) => {
  const { title, type, start_time, end_time } = req.body;

  if (!title || !type) {
    return res.status(400).json({ message: "Title and type are required." });
  }

  const session = await StudySession.create({
    title,
    type,
    created_by: req.user.id,
    start_time: start_time || Date.now(),
    end_time: end_time || null,
  });

  await SessionParticipant.create({
    session_id: session._id,
    user_id: req.user.id,
  });

  return res.status(201).json({
    message: "Study session created.",
    session,
  });
};

// Join an existing study session.
const joinSession = async (req, res) => {
  const { sessionId } = req.params;

  const session = await StudySession.findById(sessionId);
  if (!session || !session.is_active) {
    return res.status(404).json({ message: "Session not found or inactive." });
  }

  const existing = await SessionParticipant.findOne({
    session_id: sessionId,
    user_id: req.user.id,
  });

  if (existing) {
    return res.status(200).json({ message: "Already joined this session." });
  }

  const participant = await SessionParticipant.create({
    session_id: sessionId,
    user_id: req.user.id,
  });

  return res.status(201).json({
    message: "Joined session successfully.",
    participant,
  });
};

// Leave a study session.
const leaveSession = async (req, res) => {
  const { sessionId } = req.params;

  const result = await SessionParticipant.findOneAndDelete({
    session_id: sessionId,
    user_id: req.user.id,
  });

  if (!result) {
    return res.status(404).json({ message: "Not part of this session." });
  }

  return res.json({ message: "Left session successfully." });
};

module.exports = { createSession, joinSession, leaveSession };
