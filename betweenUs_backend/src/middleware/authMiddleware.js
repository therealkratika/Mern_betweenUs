const admin = require("../firebaseAdmin");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    // 🔐 Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 🔥 Find or sync backend user
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0]
      });
    }

    req.user = user; // backend user
    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR ❌", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { protect };
