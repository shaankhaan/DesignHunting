const { getDb } = require("../config/db");

// ✅ Render the About Page
const getAboutPage = async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ name: "Shan Khan" });

    res.render("about", {
      aboutData: {
        description:
          "I am a passionate Visual Graphic Designer specializing in branding, web design, and digital media.",
        name: user?.name || "Shan Khan",
        profession: user?.profession || "Graphic Designer",
        skills: [
          "Affinity Photo",
          "Affinity Designer",
          "HTML",
          "CSS",
          "JavaScript",
          "Node.js",
          "Thumbnail designs",
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error fetching about data:", error);
    res.status(500).render("about", {
      aboutData: {
        description: "Unable to load data. Please try again later.",
        name: "Shan Khan",
        profession: "Graphic Designer",
        skills: [],
      },
      errorMessage: "An error occurred while fetching about data.",
    });
  }
};

module.exports = { getAboutPage };
