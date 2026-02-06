const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const Space = require("../models/space");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");
const sendMail = require("../utils/sendEmail");

/* ======================================================
   CREATE SPACE
====================================================== */
router.post("/create", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 CRITICAL FIX
    if (user.spaceId) {
      const existingSpace = await Space.findById(user.spaceId);

      if (existingSpace) {
        return res.status(400).json({ message: "Space already exists" });
      }

      // 🧹 orphaned space reference cleanup
      user.spaceId = null;
      await user.save();
    }

    const space = await Space.create({
      ownerId: user._id,
      partnerId: null,
      inviteToken: null,
      inviteExpiresAt: null,
      inviteEmail: null,
    });

    user.spaceId = space._id;
    await user.save();

    res.status(201).json({
      spaceId: space._id,
      partnerJoined: false,
    });

  } catch (err) {
    console.error("❌ CREATE SPACE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/invite", protect, async (req, res) => {
  try {
    const { partnerEmail } = req.body;

    if (!partnerEmail) {
      return res.status(400).json({ message: "Partner email required" });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.spaceId) {
      return res.status(404).json({ message: "User or space not found" });
    }

    const space = await Space.findById(user.spaceId);
    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (space.partnerId) {
      return res.status(400).json({ message: "Partner already joined" });
    }

    // Create invite once
    if (!space.inviteToken) {
      space.inviteToken = uuidv4();
      space.inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      space.inviteEmail = partnerEmail;
      await space.save();
    }

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${space.inviteToken}`;
    try {
     await sendMail({
      to: partnerEmail,
      subject: "💜 You've been invited to a private space",
      html: `
        <h2>${user.name} invited you 💫</h2>
        <p>This is a private memory space for just two people.</p>
        <a href="${inviteLink}" style="padding:12px 20px;background:#c8b5d4;color:white;text-decoration:none;border-radius:8px">
          Accept Invitation
        </a>
        <p>This link expires in 48 hours.</p>
      `
      });
    } catch (mailErr) {
      console.error("❌ EMAIL ERROR:", mailErr);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({
      message: "Invite sent successfully",
      inviteSent: true,
      inviteEmail: partnerEmail,
      inviteLink
    });

  } catch (err) {
    console.error("❌ INVITE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/invite/resend", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.spaceId) {
      return res.status(404).json({ message: "User or space not found" });
    }

    const space = await Space.findById(user.spaceId);

    if (!space || !space.inviteToken || !space.inviteEmail) {
      return res.status(400).json({ message: "No active invite to resend" });
    }

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${space.inviteToken}`;

    try {
      await sendMail({
        to: space.inviteEmail,
        subject: "💜 Invitation Reminder",
        html: `<a href="${inviteLink}">Accept Invitation</a>`
      });
    } catch (mailErr) {
      console.error("❌ EMAIL ERROR:", mailErr);
      return res.status(500).json({ message: "Failed to resend email" });
    }

    res.json({ message: "Invite resent" });

  } catch (err) {
    console.error("❌ RESEND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/invite/cancel", protect, async (req, res) => {
  try {
   const user = await User.findById(req.user.id);
if (!user || !user.spaceId) {
  return res.status(404).json({ message: "User or space not found" });
}
    const space = await Space.findById(user.spaceId);

    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    space.inviteToken = null;
    space.inviteExpiresAt = null;
    space.inviteEmail = null;

    await space.save();

    res.json({ message: "Invite cancelled", inviteSent: false });
  } catch (err) {
    console.error("❌ CANCEL INVITE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ACCEPT INVITE
====================================================== */
router.post("/accept/:token", protect, async (req, res) => {
  const space = await Space.findOne({
    inviteToken: req.params.token,
    inviteExpiresAt: { $gt: new Date() }
  });

  if (!space) {
    return res.status(400).json({ message: "Invalid or expired invite" });
  }

  if (space.partnerId) {
    return res.status(400).json({ message: "Space already locked" });
  }

  const user = await User.findById(req.user.id);

  if (user.spaceId) {
    return res.status(400).json({ message: "User already in a space" });
  }

  space.partnerId = user._id;
  space.inviteToken = null;
  space.inviteExpiresAt = null;

  user.spaceId = space._id;

  await space.save();
  await user.save();

  res.json({
    message: "Invite accepted",
    spaceId: space._id,
    partnerJoined: true
  });
});
router.get("/status", protect, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.spaceId) {
    return res.json({ state: "NO_SPACE" });
  }

  const space = await Space.findById(user.spaceId);

  if (!space.inviteToken && !space.partnerId) {
    return res.json({ state: "NO_INVITE" });
  }

  if (space.inviteToken && !space.partnerId) {
    return res.json({
      state: "INVITE_SENT",
      inviteEmail: space.inviteEmail,
      inviteLink: `${process.env.FRONTEND_URL}/invite/${space.inviteToken}`
    });
  }

  return res.json({ state: "PARTNER_JOINED" });
});

module.exports = router;
