const { getDb } = require("../config/db");

const checkDbConnection = (req, res, next) => {
  try {
    const db = getDb(); // ✅ Correct way to get the database connection
    if (!db) {
      return res.status(500).send("❌ Database not connected.");
    }
    next();
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    return res.status(500).send("❌ Database connection error.");
  }
};

module.exports = checkDbConnection;
