const admin = require("../firebaseAdmin");
const User = require("../models/user");

// backend/middleware/auth.js
module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const idToken = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 1. Try to find by UID first, then by Email
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: decoded.uid },
        { email: decoded.email }
      ]
    });

    // 2. If user exists but doesn't have the UID linked yet, update it
    if (user && !user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      await user.save();
    }

    // 3. Only create if no user exists at all
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0]
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
