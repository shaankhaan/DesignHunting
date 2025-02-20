const mongoose = require("mongoose");

let database = null;

const connectDB = async () => {
  if (database) {
    console.log("ℹ️ Using existing MongoDB connection.");
    return database; // ✅ Return existing connection
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    database = conn.connection; // ✅ Store actual connection instance

    console.log(`✅ MongoDB Connected! Database: ${database.name}`);
    return database;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// ✅ Function to get the active database connection
const getDb = () => {
  if (!database) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return database; // ✅ Correctly return Mongoose connection
};

module.exports = { connectDB, getDb };
