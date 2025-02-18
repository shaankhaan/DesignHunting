const Portfolio = require("../models/Portfolio"); // Ensure correct model import

// Log all projects (for debugging)
Portfolio.find({})
  .then((projects) => console.log(JSON.stringify(projects, null, 2)))
  .catch((err) => console.error(err));

// ✅ Render Admin Panel
const renderAdminPage = async (req, res) => {
  const projects = await Portfolio.find();
  res.render("admin", { projects });
};

// ✅ Add New Project (Supports Both File Upload & URL)
const addProject = async (req, res) => {
  try {
    const { title, description, link, imageUrl } = req.body;
    let images = [];

    if (req.file) {
      images.push(`/uploads/${req.file.filename}`); // Upload Image Path
    } else if (imageUrl) {
      images.push(imageUrl); // External Image URL
    }

    const newProject = new Portfolio({ title, description, link, images });
    await newProject.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).send("Error adding project");
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, imageURL } = req.body;
    
    let updatedProject = { title, description, link };

    // ✅ Preserve existing images if no new image is uploaded
    const existingProject = await Portfolio.findById(id);

    if (!existingProject) {
      return res.status(404).send("Project not found");
    }

    let images = existingProject.images || [];

    // ✅ If a new file is uploaded, replace the image; otherwise, if an image URL is provided, append it.
    if (req.file) {
      images = ["/uploads/" + req.file.filename];
    } else if (imageURL) {
      images.push(imageURL);
    }

    updatedProject.images = images; // ✅ Ensure images are not lost

    await Portfolio.findByIdAndUpdate(id, updatedProject, { new: true });
    res.redirect("/admin");
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).send("Internal Server Error");
  }
};

// ✅ Delete Project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Portfolio.findByIdAndDelete(id);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).send("Error deleting project");
  }
};

// ✅ Remove Single Image from a Project
const removeProjectImage = async (req, res) => {
  const { image } = req.body; // The image URL to remove
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    // Filter out the specified image (ensure both sides are trimmed for accurate comparison)
    const updatedImages = project.images.filter(
      (img) => img.trim() !== image.trim()
    );
    await Portfolio.findByIdAndUpdate(req.params.id, { images: updatedImages });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error removing image:", err);
    res.status(500).send("Error removing image");
  }
};

module.exports = { renderAdminPage, addProject, updateProject, deleteProject, removeProjectImage };
