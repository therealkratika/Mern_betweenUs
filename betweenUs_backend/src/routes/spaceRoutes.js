const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Space = require("../models/space");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");
const sendMail = require("../utils/sendEmail");

router.post("/create", auth, async (req, res) => {
  try {
    const user = req.user;

    if (user.spaceId) {
      const existingSpace = await Space.findById(user.spaceId);
      if (existingSpace) {
        return res.status(400).json({ message: "Space already exists" });
      }
      user.spaceId = null;
      await user.save();
    }

    const space = await Space.create({
      ownerId: user._id,
      partnerId: null,
      inviteToken: null,
      inviteExpiresAt: null,
      inviteEmail: null
    });

    user.spaceId = space._id;
    await user.save();

    res.status(201).json({
      spaceId: space._id,
      partnerJoined: false
    });
  } catch (err) {
    console.error("CREATE SPACE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/invite", auth, async (req, res) => {
  try {
    const { partnerEmail } = req.body;
    const user = req.user;

    if (!partnerEmail) {
      return res.status(400).json({ message: "Partner email required" });
    }

    if (!user.spaceId) {
      return res.status(404).json({ message: "User or space not found" });
    }

    const space = await Space.findById(user.spaceId);
    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (space.partnerId) {
      return res.status(400).json({ message: "Partner already joined" });
    }

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
          <a href="${inviteLink}">Accept Invitation</a>
          <p>This link expires in 48 hours.</p>
        `
      });
    } catch (err) {
      console.error("EMAIL ERROR (ignored):", err.message);
    }

    res.json({
      message: "Invite created",
      inviteSent: true,
      inviteEmail: partnerEmail,
      inviteLink
    });
  } catch (err) {
    console.error("INVITE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   RESEND INVITE
========================= */
router.post("/invite/resend", auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.spaceId) {
      return res.status(404).json({ message: "User or space not found" });
    }

    const space = await Space.findById(user.spaceId);
    if (!space?.inviteToken || !space.inviteEmail) {
      return res.status(400).json({ message: "No active invite" });
    }

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${space.inviteToken}`;

    await sendMail({
      to: space.inviteEmail,
      subject: "💜 Invitation Reminder",
      html: `<a href="${inviteLink}">Accept Invitation</a>`
    });

    res.json({ message: "Invite resent" });
  } catch (err) {
    console.error("RESEND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CANCEL INVITE
========================= */
router.post("/invite/cancel", auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.spaceId) {
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
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/accept/:token", auth, async (req, res) => {
  try {
    const space = await Space.findOne({
      inviteToken: req.params.token,
      inviteExpiresAt: { $gt: new Date() }
    });

    if (!space || space.partnerId) {
      return res.status(400).json({ message: "Invalid invite" });
    }

    const user = req.user;

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
  } catch (err) {
    console.error("ACCEPT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/status", auth, async (req, res) => {
  try {
    const user = req.user;

    // 1️⃣ No space at all
    if (!user.spaceId) {
      return res.json({ state: "NO_SPACE" });
    }

    const space = await Space.findById(user.spaceId);

    // 2️⃣ Space exists, no invite, no partner
    if (!space.inviteToken && !space.partnerId) {
      return res.json({ state: "NO_INVITE" });
    }

    // 3️⃣ Invite sent, waiting
    if (space.inviteToken && !space.partnerId) {
      return res.json({
        state: "INVITE_SENT",
        inviteEmail: space.inviteEmail,
        inviteLink: `${process.env.FRONTEND_URL}/invite/${space.inviteToken}`
      });
    }

    // 4️⃣ Partner joined
    return res.json({ state: "PARTNER_JOINED" });

  } catch (err) {
    console.error("STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
