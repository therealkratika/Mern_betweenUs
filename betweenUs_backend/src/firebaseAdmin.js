require("dotenv").config();
var admin = require("firebase-admin");

// 🔒 Fail fast instead of crashing mysteriously
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("❌ FIREBASE_PRIVATE_KEY is missing");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

module.exports = admin;
