const express = require("express");
const jwt = require("jsonwebtoken");
const Space = require("../models/space");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        spaceId: null,
        inviteSent: false,
        partnerJoined: false,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    if (user.isScheduledForDeletion) {
  user.isScheduledForDeletion = false;
  user.deleteAt = null;
  await user.save();
}

    let space = null;
    if (user.spaceId) {
      space = await Space.findById(user.spaceId);
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        spaceId: space ? space._id : null,
        inviteSent: space ? !!space.inviteToken : false,
        partnerJoined: space ? !!space.partnerId : false,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "spaceId",
        populate: [
          { path: "ownerId", select: "name email" },
          { path: "partnerId", select: "name email" }
        ]
      });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

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
        spaceId: user.spaceId?._id || null,
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

router.post("/forgot-password", async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.json({message: " if email exists, link sent"});
  }
  const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now()+100*60*30;
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html:
      `<p>You requested a password reset.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 30 minutes.</p>
    `
    });
    res.json({message: "Reset Link sent"});
});
router.post("/reset-password/:token",async(req,res)=>{
  const{password} = req.body;
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {$gt: Date.now()}
  });
  if(!user){
    return res.status(400).json({message: "Invalid or expired token"});
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

await user.save();
res.json({message: "Password reset successfully"});
});
router.put("/change-password",protect,async(req,res)=>{
  const {currentPassword,newPassword }= req.body;
  const user = await User.findById(req.user.id);
  if(!(await user.matchPassword(currentPassword))){
    res.status(400).json({message:"Current password is wrong"});
  }
  user.password = newPassword;
  user.save();
  res.json({messahe: "Password Updated"});
});
router.delete("/delete-account", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Already scheduled
    if (user.isScheduledForDeletion) {
      return res.status(400).json({
        message: "Account is already scheduled for deletion"
      });
    }

    // ⏳ 30 days from now
    const deleteAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    user.isScheduledForDeletion = true;
    user.deleteAt = deleteAt;
    await user.save();

    // 🧩 Schedule partner deletion (same space)
    if (user.spaceId) {
      const space = await Space.findById(user.spaceId);

      if (space) {
        const partnerId =
          space.user1?.toString() === user._id.toString()
            ? space.user2
            : space.user1;

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
    console.error("❌ DELETE ACCOUNT ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
