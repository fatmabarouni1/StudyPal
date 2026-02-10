import Goal from "../models/Goal.js";

// Create a custom goal for the logged-in user.
const createGoal = async (req, res) => {
  const { title, description, target, unit, deadline, current } = req.body;

  if (!title || !unit || target === undefined || target === null) {
    return res.status(400).json({ message: "Title, target, and unit are required." });
  }

  const goal = await Goal.create({
    title: title.trim(),
    description: description?.trim() || "",
    target: Number(target),
    current: Number(current) || 0,
    unit: unit.trim(),
    deadline: deadline ? new Date(deadline) : null,
    user_id: req.user.id,
  });

  return res.status(201).json({ message: "Goal created.", goal });
};

// List custom goals for the logged-in user.
const listGoals = async (req, res) => {
  const goals = await Goal.find({ user_id: req.user.id }).sort({ created_at: -1 });
  return res.json({ goals });
};

// Update a custom goal for the logged-in user.
const updateGoal = async (req, res) => {
  const { title, description, target, unit, deadline, current } = req.body;
  const updates = {};

  if (title !== undefined) {
    updates.title = title?.trim() || "Untitled Goal";
  }
  if (description !== undefined) {
    updates.description = description?.trim() || "";
  }
  if (target !== undefined) {
    updates.target = Number(target);
  }
  if (current !== undefined) {
    updates.current = Number(current);
  }
  if (unit !== undefined) {
    updates.unit = unit?.trim() || "";
  }
  if (deadline !== undefined) {
    updates.deadline = deadline ? new Date(deadline) : null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No updates provided." });
  }

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.goalId, user_id: req.user.id },
    updates,
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  return res.json({ message: "Goal updated.", goal });
};

// Delete a custom goal for the logged-in user.
const deleteGoal = async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.goalId,
    user_id: req.user.id,
  });

  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  return res.json({ message: "Goal deleted." });
};

export { createGoal, listGoals, updateGoal, deleteGoal };
