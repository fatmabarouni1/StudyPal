import MusicPreference from "../models/MusicPreference.js";

// Create or update the music preference for a user.
const setPreference = async (req, res) => {
  const { platform, track_url, shared } = req.body;

  if (!platform || !track_url) {
    return res.status(400).json({ message: "Platform and track URL are required." });
  }

  const preference = await MusicPreference.findOneAndUpdate(
    { user_id: req.user.id },
    {
      platform,
      track_url,
      shared: Boolean(shared),
      created_at: new Date(),
    },
    { new: true, upsert: true }
  );

  return res.json({ message: "Music preference saved.", preference });
};

// Get the logged-in user's music preference.
const getPreference = async (req, res) => {
  const preference = await MusicPreference.findOne({ user_id: req.user.id });

  if (!preference) {
    return res.status(404).json({ message: "No music preference found." });
  }

  return res.json({ preference });
};

export { setPreference, getPreference };
