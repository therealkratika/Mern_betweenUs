const admin = require("../firebaseAdmin");
const User = require("../models/user");

module.exports = async function auth(req, res, next) {
  try {

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const idToken = header.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await User.findOne({ firebaseUid: decoded.uid });
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
    console.error("❌ AUTH FAILED:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
