const { getDb } = require("../config/db"); // Adjust path as needed

const getPortfolioPage = async (req, res) => {
  try {
    const db = getDb();
    const portfolioCollection = db.collection("portfolio");
    const portfolioData = await portfolioCollection.find().toArray();
    res.render("portfolio", {
      portfolioData: portfolioData || [],
      errorMessage: portfolioData.length ? null : "No portfolio projects available.",
    });
  } catch (error) {
    console.error("Error fetching portfolio data:", error.message);
    res.status(500).render("portfolio", {
      portfolioData: [],
      errorMessage: "An error occurred while fetching portfolio data.",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const slug = req.params.slug.trim(); // e.g., "mushroom-logo"
    const db = getDb();
    const portfolioCollection = db.collection("portfolio");

    // Use a regex to match the stored link that ends with the slug.
    const projectData = await portfolioCollection.findOne({
      link: { $regex: new RegExp("/portfolio/" + slug + "$", "i") }
    });

    if (!projectData) {
      return res.status(404).render("project-details", {
        projectData: null,
        errorMessage: "Project not found.",
      });
    }

    res.render("project-details", { projectData, errorMessage: null });
  } catch (error) {
    console.error("Error fetching project details:", error.message);
    res.status(500).render("project-details", {
      projectData: null,
      errorMessage: "An error occurred while fetching project details.",
    });
  }
};

module.exports = { getPortfolioPage, getProjectDetails };
