// seedPortfolio.js
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

async function seedPortfolio() {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected!");
    const db = mongoose.connection;
    const portfolioCollection = db.collection("portfolio");

    const existingPortfolio = await portfolioCollection.findOne({ title: "Thumbnails Projects" });
    if (!existingPortfolio) {
      await portfolioCollection.insertMany([
        {
          title: "Thumbnails Projects",
          description: "A collection of thumbnail designs.",
          link: "/portfolio/thumbnails",
          images: [
            "/images/thumb1.png",
            "/images/thumb2.jpg",
            "/images/thumbnail_edit.jpg",
            "/images/property.jpg",
          ],
        },
        {
          title: "Crafting of My Mushroom",
          description: "An illustration project for a Mushroom visual concept.",
          link: "/portfolio/mushroom-logo",
          images: [
            "/images/mushroom_edit.png",
            "/images/grapes_edit11.png",
            "/images/floral_edit_v03.png",
            "/images/Wolf_edit.png",
            "/images/EcoScape_edit.png",
          ],
        },
        {
          title: "Web Development",
          description: "A full-stack web development project.",
          link: "/portfolio/web-development",
          images: ["/images/website.jpg", "/images/wireframe.jpg"],
        },
      ]);
      console.log("✅ Inserted sample portfolio data.");
    } else {
      console.log("✅ Portfolio data already exists.");
    }
  } catch (error) {
    console.error("❌ Error inserting/updating sample data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedPortfolio();
