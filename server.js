require("dotenv").config(); // Load environment variables

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const compression = require("compression");
const { MongoClient } = require("mongodb");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view cache", true); // Enable template caching

// Serve static files (with caching for performance)
app.use(express.static("public", { maxAge: "1d" }));

// Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri); // ✅ Removed deprecated options
let isDbConnected = false;

async function connectToDatabase() {
  try {
    await client.connect();
    isDbConnected = true;
    console.log("✅ Connected to MongoDB Atlas!");

    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const portfolioCollection = database.collection("portfolio");

    // Check and insert sample user data if missing
    if (!(await usersCollection.findOne({ name: "Shan Khan" }))) {
      await usersCollection.insertOne({ name: "Shan Khan", profession: "Graphic Designer" });
      console.log("Inserted sample user data.");
    }

    // Check and update portfolio data if needed
    const existingPortfolio = await portfolioCollection.findOne({ title: "Thumbnails Projects" });
    if (!existingPortfolio) {
      await portfolioCollection.insertMany([
        {
          title: "Thumbnails Projects",
          description: "A collection of thumbnail designs.",
          link: "/portfolio/thumbnails",
          images: ["/images/thumb1.png", "/images/thumb2.jpg", "/images/thumbnail_edit.jpg", "/images/property.jpg"],
        },
        {
          title: "Crafting of My Mushroom",
          description: "An illustration project for a Mushroom visual concept.",
          link: "/portfolio/mushroom-logo",
          images: ["/images/mushroom_edit.png", "/images/grapes_edit11.png", "/images/floral_edit_v03.png", "/images/Wolf_edit.png", "/images/Eco Scape edit.png"],
        },
        {
          title: "Web Development",
          description: "A full-stack web development project.",
          link: "/portfolio/web-development",
          images: ["/images/website.jpg", "/images/wireframe.jpg"],
        }
      ]);
      console.log("Inserted sample portfolio data.");
    } else {
      await portfolioCollection.updateOne(
        { title: "Thumbnails Projects" },
        {
          $set: {
            description: "Updated description for Thumbnails Projects",
            images: ["/images/thumbnail_edit.jpg", "/images/thumb1.png", "/images/property.jpg", "/images/thumb2.jpg"],
          },
        }
      );
      console.log("Updated existing portfolio data.");
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

// Connect to MongoDB
connectToDatabase().catch(console.error);

// Routes
app.get("/", async (req, res) => {
  if (!isDbConnected) {
    return res.status(500).send("Database not connected");
  }

  try {
    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const user = await usersCollection.findOne({ name: "Shan Khan" });

    if (!user) return res.status(404).send("User not found");

    res.render("home", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user data");
  }
});

app.get("/about", async (req, res) => {
  if (!isDbConnected) {
    return res.status(500).send("Database not connected");
  }

  try {
    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const user = await usersCollection.findOne({ name: "Shan Khan" });

    res.render("about", {
      aboutData: {
        description: "I am a passionate Visual Graphic Designer specializing in branding, web design, and digital media.",
        name: user?.name || "Shan Khan",
        profession: user?.profession || "Graphic Designer",
        skills: ["Affinity Photo", "Affinity Designer", "HTML", "CSS", "JavaScript", "Node.js", "Thumbnail design"],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching about data");
  }
});

app.get("/portfolio", async (req, res) => {
  if (!isDbConnected) {
    return res.status(500).send("Database not connected");
  }

  try {
    const database = client.db("portfolio");
    const portfolioCollection = database.collection("portfolio");
    const portfolioData = await portfolioCollection.find().toArray();

    if (!portfolioData.length) return res.status(404).send("No portfolio projects found");

    res.render("portfolio", { portfolioData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching portfolio data");
  }
});

app.get("/portfolio/:project", async (req, res) => {
  if (!isDbConnected) {
    return res.status(500).send("Database not connected");
  }

  try {
    const { project } = req.params;
    const database = client.db("portfolio");
    const portfolioCollection = database.collection("portfolio");

    const projectData = await portfolioCollection.findOne({ link: `/portfolio/${project}` });

    if (!projectData) return res.status(404).send("Project not found");

    res.render("project-details", { projectData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching project details");
  }
});

app.get("/contact", (req, res) => {
  res.render("contact", { successMessage: null, errorMessage: null });
});

app.post("/submit", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render("contact", { errorMessage: "All fields are required!", successMessage: null });
  }

  try {
    const database = client.db("portfolio");
    const contactCollection = database.collection("contactMessages");

    await contactCollection.insertOne({ name, email, message });
    console.log("✅ Contact message stored!");

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: email,
      to: "baghishaan@gmail.com",
      subject: `New message from ${name}`,
      text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Email error:", error);
        return res.render("contact", { errorMessage: "Error sending message.", successMessage: null });
      }
      console.log("📧 Email sent:", info.response);
      res.render("contact", { successMessage: "Message sent successfully!", errorMessage: null });
    });

  } catch (error) {
    console.error(error);
    res.render("contact", { errorMessage: "An error occurred.", successMessage: null });
  }
});

const PORT = process.env.PORT || 8081;

// Check if running in Vercel or locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} else {
  module.exports = app; // For Vercel
}
