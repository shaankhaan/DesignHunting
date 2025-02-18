const express = require("express");
const router = express.Router();
const { getPortfolioPage, getProjectDetails } = require("../controllers/portfolioController");
const checkDbConnection = require("../middleware/checkDbConnection");
const Project = require("../models/Portfolio"); // Your Portfolio model

// Portfolio list page
router.get("/portfolio", checkDbConnection, getPortfolioPage);

// Route for individual project details – :slug will be "mushroom-logo" for your project.
router.get("/portfolio/:slug", checkDbConnection, getProjectDetails);

router.put("/admin/project/:id/add-images", async (req, res) => {
  const { newImages } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    // Process the newImages field (if provided)
    let newImagesArray = [];
    if (newImages && newImages.trim() !== "") {
      newImagesArray = newImages.split(",").map(img => img.trim()).filter(Boolean);
    }
    // Append new images to the existing images array
    const updatedImages = project.images.concat(newImagesArray);
    await Project.findByIdAndUpdate(req.params.id, { images: updatedImages });
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating project images");
  }
});


module.exports = router;
