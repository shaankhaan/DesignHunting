const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  renderAdminPage,
  addProject,
  deleteProject,
  updateProject,
  removeProjectImage, // Controller function for removing an image
} = require("../controllers/adminController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated"); // Authentication middleware

// ✅ Setup Multer for File Uploads
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ Protected Admin Dashboard Route
router.get("/", ensureAuthenticated, renderAdminPage);

// ✅ Protected API Routes for CRUD Operations
router.post("/project", ensureAuthenticated, upload.single("imageFile"), addProject);
router.put("/project/:id", ensureAuthenticated, upload.single("imageFile"), updateProject);
router.delete("/project/:id", ensureAuthenticated, deleteProject);

// ✅ New Route to Remove a Single Project Image (Protected)
router.delete("/project/:id/remove-image", ensureAuthenticated, removeProjectImage);

module.exports = router;
