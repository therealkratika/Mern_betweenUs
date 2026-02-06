const express = require("express");
const router = express.Router();

const User = require("../models/user");
const DayMemory = require("../models/dayMemory");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, async (req, res) => {
  try {
    const { date, photos, coverPhotoIndex, caption, emotion } = req.body;

    if (!date || !photos || photos.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.spaceId) {
      return res.status(403).json({ message: "No space access" });
    }

    const memory = await DayMemory.create({
      spaceId: user.spaceId,
      date,
      caption,
      emotion,
      coverPhotoIndex,
      photos: photos.map((url) => ({ url })) // ✅ CRITICAL FIX
    });

    res.status(201).json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/timeline", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.spaceId) {
    return res.status(403).json({ message: "No space" });
  }

  const memories = await DayMemory.find({
    spaceId: user.spaceId
  }).sort({ date: -1 });

  res.json(memories);
});
// routes/memories.js
router.get("/:id", protect, async (req, res) => {
  const memory = await DayMemory.findById(req.params.id);

  if (!memory) {
    return res.status(404).json({ message: "Memory not found" });
  }

  // Optional safety: ensure same space
  const user = await User.findById(req.user.id);
  if (!user.spaceId.equals(memory.spaceId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(memory);
});
router.post("/:id/react", protect, async (req, res) => {
  const { emoji } = req.body;
  const userId = req.user.id;

  const memory = await DayMemory.findById(req.params.id);
  if (!memory) {
    return res.status(404).json({ message: "Memory not found" });
  }

  const existingIndex = memory.reactions.findIndex(
    (r) => r.emoji === emoji && r.userId.toString() === userId
  );

  if (existingIndex !== -1) {
    // ❌ remove reaction
    memory.reactions.splice(existingIndex, 1);
  } else {
    // ✅ add reaction
    memory.reactions.push({ emoji, userId });
  }

  await memory.save();

  res.json({ reactions: memory.reactions });
});
/**
 * 🔐 Delete a memory
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.spaceId) {
      return res.status(403).json({ message: "No space access" });
    }

    const memory = await DayMemory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    // ✅ Only allow delete if memory belongs to same space
    if (memory.spaceId.toString() !== user.spaceId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await memory.deleteOne();

    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    console.error("DELETE MEMORY ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/on-this-day", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.spaceId) {
      return res.status(404).json({ message: "No space found" });
    }

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // same calendar day, any year
    const sameDayMemories = await DayMemory.find({
      spaceId: user.spaceId,
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: "$date" }, day] },
          { $eq: [{ $month: "$date" }, month] }
        ]
      }
    }).sort({ date: -1 });

    // recent memories
    const recent = {
      yesterday: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    const recentMemories = await DayMemory.find({
      spaceId: user.spaceId,
      date: { $gte: recent.month }
    }).sort({ date: -1 });

    res.json({
      sameDay: sameDayMemories,
      recent: recentMemories
    });

  } catch (err) {
    console.error("ON THIS DAY ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
