const { getDb } = require("../config/db");

// ✅ Render the Home Page
const getHomePage = async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection("users");

    // ✅ Fetch a sample user
    const user = await usersCollection.findOne({ name: "Shan Khan" });

    if (!user) {
      console.warn("⚠️ User not found in database.");
      return res.render("home", {
        user: {
          name: "Shan Khan",
          profession: "Graphic Designer",
        },
        errorMessage: "User data not found, displaying default info.",
      });
    }

    res.render("home", { user, errorMessage: null });
  } catch (error) {
    console.error("❌ Error fetching home data:", error);
    res.status(500).render("home", {
      user: {
        name: "Shan Khan",
        profession: "Graphic Designer",
      },
      errorMessage: "An error occurred while loading the home page.",
    });
  }
};

module.exports = { getHomePage };
