// index.js
require("dotenv").config();
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Check your environment variables.");
  process.exit(1);
}

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
    let portfolioData = await mongoose.connection.collection("portfolio").find().toArray();
    res.render("portfolio", { portfolioData });
  } catch (error) {
    console.error("❌ Error fetching portfolio data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// **🔹 Start Server**
const PORT = process.env.PORT || 8081;

connectDB().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } else {
    console.log("✅ Running on Vercel (MongoDB connection handled externally)");
  }
});

// **✅ Fix: Export for Vercel**
module.exports = app;

