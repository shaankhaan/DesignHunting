const express = require("express");
const router = express.Router();
const { getContactPage, submitContactForm } = require("../controllers/contactController");
const checkDbConnection = require("../middleware/checkDbConnection");

// ✅ Apply checkDbConnection middleware to all contact routes
router.use(checkDbConnection);

// ✅ Define contact routes using controller functions
router.get("/contact", getContactPage);
router.post("/contact/submit", submitContactForm);

module.exports = router;
