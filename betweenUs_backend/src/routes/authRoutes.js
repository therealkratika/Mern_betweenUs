const express = require("express");
const router = express.Router();
const Space = require("../models/space");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user; // already synced MongoDB user

    await user.populate({
      path: "spaceId",
      populate: [
        { path: "ownerId", select: "name email" },
        { path: "partnerId", select: "name email" }
      ]
    });

    const space = user.spaceId;
    let partnerName = null;
    let partnerEmail = null;

    if (space) {
      if (
        space.ownerId &&
        space.ownerId._id.toString() !== user._id.toString()
      ) {
        partnerName = space.ownerId.name;
        partnerEmail = space.ownerId.email;
      } else if (space.partnerId) {
        partnerName = space.partnerId.name;
        partnerEmail = space.partnerId.email;
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        spaceId: space?._id || null,
        partnerJoined: !!space?.partnerId,
        partnerName,
        partnerEmail
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

    if (user.isScheduledForDeletion) {
      return res.status(400).json({
        message: "Account already scheduled for deletion"
      });
    }

    const deleteAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    user.isScheduledForDeletion = true;
    user.deleteAt = deleteAt;
    await user.save();

    if (user.spaceId) {
      const space = await Space.findById(user.spaceId);

      if (space) {
        const partnerId =
          space.ownerId?.toString() === user._id.toString()
            ? space.partnerId
            : space.ownerId;

        if (partnerId) {
          await User.findByIdAndUpdate(partnerId, {
            isScheduledForDeletion: true,
            deleteAt
          });
        }
      }
    }

    res.json({
      message:
        "Account scheduled for deletion. Login within 30 days to restore."
    });
  } catch (err) {
    console.error("DELETE ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
