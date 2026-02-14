var admin = require("firebase-admin");

var serviceAccount = require("./betweenus-45513-firebase-adminsdk-fbsvc-96b09a17c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
module.exports = admin;