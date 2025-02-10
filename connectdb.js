const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB_URL); // No need for deprecated options
        console.log("✅ CONNECTED TO DATABASE SUCCESSFULLY");
    } catch (error) {
        console.error("❌ COULD NOT CONNECT TO DATABASE:", error.message);
        process.exit(1); // Exit process on failure
    }
};
