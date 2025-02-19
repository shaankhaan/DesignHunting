const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary"); // ✅ Cloudinary for storage
const {
  renderAdminPage,
  addProject,
  deleteProject,
  updateProject,
  removeProjectImage, // ✅ Function for removing an image
} = require("../controllers/adminController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated"); // ✅ Authentication middleware

// ✅ Setup Multer with Memory Storage (Works on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Protected Admin Dashboard Route
router.get("/", ensureAuthenticated, renderAdminPage);

// ✅ Protected API Routes for CRUD Operations
router.post("/project", ensureAuthenticated, upload.single("imageFile"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, uploadResult) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }
        req.body.imageUrl = uploadResult.secure_url; // ✅ Pass URL to `addProject`
        addProject(req, res, next);
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update Project (Includes Image Upload)
router.put("/project/:id", ensureAuthenticated, upload.single("imageFile"), async (req, res, next) => {
  try {
    if (req.file) {
      // ✅ Upload to Cloudinary if new image is uploaded
      const result = await cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, uploadResult) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            return res.status(500).json({ error: "Upload failed" });
          }
          req.body.imageUrl = uploadResult.secure_url; // ✅ Pass URL to `updateProject`
          updateProject(req, res, next);
        }
      ).end(req.file.buffer);
    } else {
      updateProject(req, res, next);
    }
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Delete Project
router.delete("/project/:id", ensureAuthenticated, deleteProject);

// ✅ Remove a Single Project Image (Protected)
router.delete("/project/:id/remove-image", ensureAuthenticated, removeProjectImage);

module.exports = router;
