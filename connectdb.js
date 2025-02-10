const mongoose = require('mongoose');  // Importing mongoose

module.exports = async () => {  // Exporting an asynchronous function
    try {
        await mongoose.connect(process.env.DB_URL);  // Connecting to MongoDB
        console.log("✅ CONNECTED TO DATABASE SUCCESSFULLY");
    } catch (error) {
        console.error("❌ COULD NOT CONNECT TO DATABASE:", error.message);  // Catching and logging errors
        console.error(error);  // Print full error details for better debugging
        process.exit(1);  // Exit the process on failure (you can adjust this later for graceful shutdown)
    }
};
