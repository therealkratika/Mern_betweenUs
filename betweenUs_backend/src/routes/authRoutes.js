const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.get("/me", auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      spaceId: req.user.spaceId || null, // Ensure this matches your DB field name
      partnerJoined: req.user.partnerJoined || false 
    }
  });
});
/* =========================
   DELETE ACCOUNT
========================= */
router.delete("/delete-account", auth, async (req, res) => {
  try {
    const user = req.user;

    user.isScheduledForDeletion = true;
    user.deleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      message: "Account scheduled for deletion. Login within 30 days to restore.",
    });
  } catch (err) {
    console.error("DELETE ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   EXPORT ONCE (ONLY HERE)
========================= */
module.exports = router;
