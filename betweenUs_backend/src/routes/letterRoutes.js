const express = require("express");
const router = express.Router();

const Letter = require("../models/letters");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
router.post("/", auth, async (req, res) => {
  const { title, content, unlockDate } = req.body;

  if (!title || !content || !unlockDate) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findById(req.user.id);

  if (!user || !user.spaceId) {
    return res.status(403).json({ message: "No space access" });
  }

  const letter = await Letter.create({
    spaceId: user.spaceId,
    title,
    content,
    unlockDate,
    createdBy: user._id
  });

  res.status(201).json(letter);
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.spaceId) {
    return res.status(403).json({ message: "No space access" });
  }

  const letters = await Letter.find({ spaceId: user.spaceId })
    .sort({ unlockDate: 1 });

  const now = new Date();

  const formatted = letters.map((l) => ({
    id: l._id,
    title: l.title,
    unlockDate: l.unlockDate,
    isUnlocked: now >= l.unlockDate
  }));

  res.json(formatted);
});

router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const letter = await Letter.findById(req.params.id);

  if (!letter || !user || letter.spaceId.toString() !== user.spaceId.toString()) {
    return res.status(404).json({ message: "Letter not found" });
  }

  if (new Date() < letter.unlockDate) {
    return res.status(403).json({ message: "Letter locked" });
  }

  res.json(letter);
});

module.exports = router;
