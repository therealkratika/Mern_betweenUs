const User = require("../models/user");

async function syncUser(decoded) {
  let user = await User.findOne({ firebaseUid: decoded.uid });

  if (!user) {
    user = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: decoded.name || "User",
    });
  }

  return user;
}

module.exports = syncUser;
