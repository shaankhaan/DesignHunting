const mongoose = require("mongoose");

let database = null; // Keep track of the database connection instance

// Function to connect to MongoDB
const connectDB = async () => {
  // If an existing database connection is present, return it
  if (database) {
    console.log("ℹ️ Using existing MongoDB connection.");
    return database; // Return the already established connection
  }

  try {
    // MongoDB URI is fetched from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,      // Use new MongoDB URL parser
      useUnifiedTopology: true,  // Use new unified topology engine
      useFindAndModify: false,   // Disable legacy find and modify methods
      useCreateIndex: true,      // Enable automatic index creation
    });

    database = mongoose.connection; // Store actual connection instance

    console.log(`✅ MongoDB Connected! Database: ${database.name}`);
    return database;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Terminate process if connection fails
  }
};

// Function to retrieve the active database connection instance
const getDb = () => {
  if (!database) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return database.db; // Return the `db` instance for direct use
};

// Export both functions for use in other parts of the app
module.exports = { connectDB, getDb };
