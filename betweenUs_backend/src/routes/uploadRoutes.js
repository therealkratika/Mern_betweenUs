const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/couldinary");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

router.post("/signature", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.spaceId) {
    return res.status(403).json({ message: "No space access" });
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `spaces/${user.spaceId}`
    },
    process.env.CLOUDINARY_SECRET
  );

  res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_KEY,
    folder: `spaces/${user.spaceId}`
  });
});
module.exports = router;
