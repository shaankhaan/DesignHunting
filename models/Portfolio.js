const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  images: [String],
});

// Prevent Overwriting the Model
const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema, "portfolio");

module.exports = Portfolio;
