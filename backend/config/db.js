const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cybershield";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[CyberShield DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`[CyberShield DB] MongoDB Connection Error: ${error.message}`);
    console.error("[CyberShield DB] Tip: Ensure MongoDB is running locally or set MONGODB_URI in environment variables.");
    return false;
  }
};

const getDBStatus = () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || "none",
    name: mongoose.connection.name || "none"
  };
};

module.exports = { connectDB, getDBStatus };
