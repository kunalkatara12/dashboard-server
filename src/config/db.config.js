import { connect, disconnect } from "mongoose";

async function connectToDB() {
  const mongoURL = process.env.MONGODB_URL || "";
  if (mongoURL === "") {
    console.log("MongoDB URL not found in .env file");
    throw new Error("MongoDB URL not found in .env file");
  }
  try {
    const connectionInstance = await connect(mongoURL);
    console.log(
      `Connected to MongoDB successfully! && DB Host: ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log("Error connecting to database in db.config.js:", err);
    throw new Error("Error connecting to database in db.config.js");
  }
}

async function closeDBConnection() {
  try {
    await disconnect();
    console.log("Connection closed successfully!");
  } catch (err) {
    console.log("Error closing connection in db.config.js:", err);
    throw new Error("Error closing connection in db.config.js");
  }
}

export { connectToDB, closeDBConnection };
