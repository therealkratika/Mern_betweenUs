const express = require("express");
const router = express.Router();

const DayMemory = require("../models/dayMemory");
const auth = require("../middleware/authMiddleware");

router.post("/add", auth, async (req, res) => {
  try {
    const { date, photos, coverPhotoIndex, caption, emotion } = req.body;
    const user = req.user;

    if (!date || !photos || photos.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!user.spaceId) {
      return res.status(403).json({ message: "No space access" });
    }

    const memory = await DayMemory.create({
      spaceId: user.spaceId,
      date,
      caption,
      emotion,
      coverPhotoIndex,
      photos: photos.map((url) => ({ url }))
    });

    res.status(201).json(memory);
  } catch (err) {
    console.error("ADD MEMORY ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/timeline", auth, async (req, res) => {
  const user = req.user;

  if (!user.spaceId) {
    return res.status(403).json({ message: "No space" });
  }

  const memories = await DayMemory.find({
    spaceId: user.spaceId
  }).sort({ date: -1 });

  res.json(memories);
});

router.get("/:id", auth, async (req, res) => {
  const user = req.user;
  const memory = await DayMemory.findById(req.params.id);

  if (!memory) {
    return res.status(404).json({ message: "Memory not found" });
  }

  if (!user.spaceId.equals(memory.spaceId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(memory);
});

router.post("/:id/react", auth, async (req, res) => {
  const { emoji } = req.body;
  const userId = req.user._id;

  const memory = await DayMemory.findById(req.params.id);
  if (!memory) {
    return res.status(404).json({ message: "Memory not found" });
  }

  const existingIndex = memory.reactions.findIndex(
    (r) => r.emoji === emoji && r.userId.toString() === userId.toString()
  );

  if (existingIndex !== -1) {
    memory.reactions.splice(existingIndex, 1);
  } else {
    memory.reactions.push({ emoji, userId });
  }

  await memory.save();
  res.json({ reactions: memory.reactions });
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const user = req.user;
    const memory = await DayMemory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (!user.spaceId || memory.spaceId.toString() !== user.spaceId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await memory.deleteOne();
    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    console.error("DELETE MEMORY ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/on-this-day", auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.spaceId) {
      return res.status(404).json({ message: "No space found" });
    }

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const sameDay = await DayMemory.find({
      spaceId: user.spaceId,
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: "$date" }, day] },
          { $eq: [{ $month: "$date" }, month] }
        ]
      }
    }).sort({ date: -1 });

    const recent = await DayMemory.find({
      spaceId: user.spaceId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });

    res.json({ sameDay, recent });
  } catch (err) {
    console.error("ON THIS DAY ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
