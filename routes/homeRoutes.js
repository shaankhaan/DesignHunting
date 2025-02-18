const express = require("express");
const router = express.Router();
const { getHomePage } = require("../controllers/homeController");

// Home Page Route (Public)
router.get("/", getHomePage);

// Display Login Form
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Process Login Submission (in homeRoutes.js or your auth route)
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    // Use environment variables for credentials (or check against a database)
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Set isAdmin to true for admin users.
      req.session.user = { username: process.env.ADMIN_USERNAME, isAdmin: true };
      return res.redirect("/admin");
    }
    res.render("login", { error: "Invalid credentials" });
  });
  

// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
