require("dotenv").config(); // ✅ Load environment variables

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const compression = require("compression");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const { connectDB } = require("../config/db"); // ✅ Correct import
const methodOverride = require("method-override");

// ✅ Import Routes
const adminRoutes = require("../routes/adminRoutes");
const homeRoutes = require("../routes/homeRoutes");
const aboutRoutes = require("../routes/aboutRoutes");
const portfolioRoutes = require("../routes/portfolioRoutes");
const contactRoutes = require("../routes/contactRoutes");
const Portfolio = require("../models/Portfolio");

const app = express(); // ✅ Define Express app

// **🔹 Middleware**
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view cache", true);
app.use(methodOverride("_method"));

// ✅ Session Management (Replaces MemoryStore in Production)
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true,
};

if (process.env.NODE_ENV === "production") {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  });
}
app.use(session(sessionConfig));

// ✅ Set `user` globally in `res.locals`
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ✅ Serve Static Files (Optimized with caching)
app.use(express.static(path.join(__dirname, "../public"), { maxAge: "1d" }));

// **🔹 Register Routes**
app.use("/admin", adminRoutes);
app.use("/", homeRoutes);
app.use("/", aboutRoutes);
app.use("/", portfolioRoutes);
app.use("/", contactRoutes);

// **🔹 Portfolio Page Route**
app.get("/portfolio", async (req, res) => {
  try {
    let portfolioData = await Portfolio.find();

    // 🔹 Ensure images are always arrays (if stored as comma-separated strings)
    portfolioData = portfolioData.map((project) => {
      if (project.images && typeof project.images[0] === "string" && project.images[0].includes(",")) {
        project.images = project.images[0].split(",").map((img) => img.trim());
      }
      return project;
    });

    res.render("portfolio", { portfolioData });
  } catch (error) {
    console.error("❌ Error fetching portfolio data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// **🔹 Test Database Route**
app.get("/test-db", async (req, res) => {
  try {
    let portfolioItems = await Portfolio.find();
    console.log("✅ Fetched portfolio data:", portfolioItems);
    res.json(portfolioItems);
  } catch (error) {
    console.error("❌ Error fetching portfolio:", error);
    res.status(500).send("Database error");
  }
});

// **🔹 Connect to MongoDB and Seed Sample Data**
async function initializeDatabase() {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected!");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const portfolioCollection = db.collection("portfolio");

    // ✅ Insert sample user data if missing
    const userExists = await usersCollection.findOne({ name: "Shan Khan" });
    if (!userExists) {
      await usersCollection.insertOne({ name: "Shan Khan", profession: "Graphic Designer" });
      console.log("✅ Inserted sample user data.");
    }

    // ✅ Check & insert/update portfolio data
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
    }
  } catch (error) {
    console.error("❌ Error inserting/updating sample data:", error);
  }
}

// **🔹 Start Server**
const PORT = process.env.PORT || 8081;

// ✅ Ensure MongoDB is initialized before starting the server
initializeDatabase().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } else {
    console.log("✅ Running on Vercel (MongoDB connection handled externally)");
  }
});

// **✅ Fix: Export for Vercel**
module.exports = (req, res) => {
  app(req, res);
};
