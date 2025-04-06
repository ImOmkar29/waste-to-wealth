const { admin, db } = require("./firebaseAdmin");

async function assignRole(uid, role) {
  if (!uid || !role) {
    console.error("Error: UID and Role are required!");
    return;
  }

  try {
    // ✅ Update Firestore User Document
    await db.collection("users").doc(uid).set({ role }, { merge: true });

    // ✅ Set Custom User Claims in Firebase Auth
    await admin.auth().setCustomUserClaims(uid, { role });

    console.log(`✅ Role '${role}' assigned to user: ${uid}`);
  } catch (error) {
    console.error("Error assigning role:", error);
  }
}
// 🔹 Change these values to test with real user UID
const testUserId = "8JYfMJeJt0VOsmX2ZCg6EzAzR3w2"; // Replace with actual UID
const roleToAssign = "admin"; // Options: "admin", "seller", "buyer"

assignRole(testUserId, roleToAssign);
