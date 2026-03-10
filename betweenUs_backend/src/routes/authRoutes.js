const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Space = require("../models/space");
const User = require("../models/user");

router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user;

    let partnerJoined = false;
    let partnerName = null;

    if (user.spaceId) {
      const space = await Space.findById(user.spaceId);

      if (space?.partnerId) {
        partnerJoined = true;

        const partnerUser = await User.findById(space.partnerId).select("name email");
        partnerName = partnerUser?.name || null;
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        spaceId: user.spaceId || null,
        partnerJoined,
        partnerName
      }
    });
  } catch (err) {
    console.error("ME ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});
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

module.exports = router;
