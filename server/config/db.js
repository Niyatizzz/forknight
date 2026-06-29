// config/db.js
import mongoose from "mongoose";

/**
 * Connect to MongoDB using the MONGO_URI env variable.
 * Called once at server startup.
 */
const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // fatal — can't run without DB
  }
};

export default connectDB;
