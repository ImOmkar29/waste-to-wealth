const admin = require("firebase-admin");
const serviceAccount = require("./firebaseAdminConfig.json"); // Ensure correct path

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
