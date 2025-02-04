require('dotenv').config();  // Load environment variables
console.log("MongoDB URI:", process.env.MONGO_URI);  // Log the URI to confirm it's loaded

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const compression = require('compression');
const { MongoClient } = require("mongodb"); // MongoDB client

const app = express();

// Middleware for compression (faster page load)
app.use(compression());

// Enable template caching
app.set('view cache', true);

// Static files (CSS, JS, images) with caching
app.use(express.static("public", { maxAge: '1d' }));

// Use body-parser to handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// EJS Layouts
app.set("view engine", "ejs");
app.use(expressLayouts);

// Check if MongoDB URI is correctly loaded
if (!process.env.MONGO_URI) {
  console.error("MongoDB URI is not defined. Please set the MONGO_URI in your .env file.");
  process.exit(1); // Exit if the URI is not available
}

// MongoDB Connection Setup
const uri = process.env.MONGO_URI;  // MongoDB connection string from .env file
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    // Example: Connect to the 'portfolio' database
    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const portfolioCollection = database.collection("portfolio");
    const contactCollection = database.collection("contactMessages");

    // Store sample user data (just for initial setup)
    const existingUser = await usersCollection.findOne({ name: "Shan Khan" });
    if (!existingUser) {
      await usersCollection.insertOne({ name: "Shan Khan", profession: "Graphic Designer" });
      console.log("Inserted sample user data.");
    }

    // Store sample portfolio data (just for initial setup)
    const existingPortfolio = await portfolioCollection.findOne({ title: "Thumbnails Projects" });
    if (!existingPortfolio) {
      await portfolioCollection.insertMany([
        { 
          title: "Thumbnails Projects", 
          description: "A collection of thumbnail designs created for various clients.", 
          link: "/portfolio/thumbnails", 
          images: ["/images/thumb1.png", "/images/thumb2.jpg", "/images/thumbnail_edit.jpg", "/images/property.jpg"]
        },
        { 
          title: "Crafting of My Mushroom", 
          description: "An illustration project for a Mushroom visual concept involving a nature theme.", 
          link: "/portfolio/mushroom-logo", 
          images: ["/images/mushroom_edit.png", "/images/grapes_edit11.png", "/images/floral_edit_v03.png", "/images/Wolf_edit.png", "/images/Eco Scape edit.png"]
        },
        { 
          title: "Web Development", 
          description: "A full-stack web development project featuring modern design and functionality.", 
          link: "/portfolio/web-development",  
          images: ["/images/website.jpg", "/images/wireframe.jpg"]
        }
      ]);
      console.log("Inserted sample portfolio data.");
    } else {
      // Update existing portfolio data if needed
      console.log("Portfolio data already exists. Updating...");
      await portfolioCollection.updateOne(
        { title: "Thumbnails Projects" },
        { 
          $set: { 
            description: "Updated description for Thumbnails Projects",
            images: ["/images/thumbnail_edit.jpg","/images/thumb1.png", "/images/property.jpg", "/images/thumb2.jpg"]
          }
        });
      console.log("Updated existing portfolio data.");
    }
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);  // Exit the process if DB connection fails
  }
}

// Call the function to connect to the database
connectToDatabase();

// Define routes
app.get("/", async (req, res) => {
  try {
    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const user = await usersCollection.findOne({ name: "Shan Khan" });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("home", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user data");
  }
});

app.get("/about", async (req, res) => {
  try {
    const database = client.db("portfolio");
    const usersCollection = database.collection("users");
    const user = await usersCollection.findOne({ name: "Shan Khan" });

    const aboutData = {
      description: "I am a passionate Visual graphic designer with a love for creating clean, modern designs. I specialize in branding, web design, and digital media.",
      name: user.name,
      profession: user.profession,
      skills: ["Affinity Photo", "Affinity Designer", "HTML", "CSS", "JavaScript", "Node js", "Thumbnail designer"]
    };

    res.render("about", { aboutData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching about data");
  }
});

app.get("/portfolio", async (req, res) => {
  try {
    const database = client.db("portfolio");
    const portfolioCollection = database.collection("portfolio");

    const portfolioData = await portfolioCollection.find().toArray();
    console.log("Fetched Portfolio Data:", portfolioData); // Debugging

    if (!portfolioData.length) {
      return res.status(404).send("No portfolio projects found");
    }
    res.render("portfolio", { portfolioData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching portfolio data");
  }
});

app.get("/portfolio/:project", async (req, res) => {
  try {
      const { project } = req.params;

      // Connect to the database
      const database = client.db("portfolio");
      const portfolioCollection = database.collection("portfolio");

      // Fetch the project based on the 'link' field
      const projectData = await portfolioCollection.findOne({
        link: `/portfolio/${project}`  // Use the project parameter directly to match the link
      });

      if (!projectData) {
          return res.status(404).send("Project not found");
      }

      // Render the project details page with the fetched data
      res.render("project-details", { projectData });
  } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching project details");
  }
});
// Contact Page Route
app.get('/contact', (req, res) => {
  res.render('contact', { successMessage: null, errorMessage: null });
});

// Handle Contact Form Submission
app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
      return res.render('contact', { errorMessage: "All fields are required!", successMessage: null });
  }

  try {
      const database = client.db("portfolio");
      const contactCollection = database.collection("contactMessages");

      const result = await contactCollection.insertOne({ name, email, message });
      console.log("Inserted contact message:", result);

      // Setup Nodemailer Transport
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          },
          tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
          from: email,
          to: "baghishaan@gmail.com",
          subject: `New message from ${name}`,
          text: `Message from: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      };

      // Send Email
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log("Error occurred:", error);
              return res.render('contact', { errorMessage: "Error sending message. Please try again.", successMessage: null });
          }
          console.log("Email sent: " + info.response);
          return res.render('contact', { successMessage: "Thank you for your message! We will get back to you soon.", errorMessage: null });
      });

  } catch (error) {
      console.error(error);
      res.render('contact', { errorMessage: "An error occurred. Please try again.", successMessage: null });
  }
});

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
