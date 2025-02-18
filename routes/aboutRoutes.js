const express = require("express");
const router = express.Router();
const { getAboutPage } = require("../controllers/aboutController");

router.get("/about", getAboutPage);

module.exports = router;
