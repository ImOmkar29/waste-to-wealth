const { auth } = require("./firebaseAdmin");

async function listUsers() {
  try {
    const listUsersResult = await auth.listUsers();
    console.log("Successfully fetched users:");
    listUsersResult.users.forEach((user) => {
      console.log(`- ${user.uid}: ${user.email}`);
    });
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

listUsers();
