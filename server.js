const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require('dotenv').config();


const app = express();
app.set("view engine", "ejs");
app.use(expressLayouts);

// Use body-parser to handle POST data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define routes
app.get("/", (req, res) => {
  res.render("home", { body: "<h1>Welcome to the homepage!</h1>" });
});

app.get("/about", (req, res) => {
  const aboutData = {
    description: "I am a passionate Visual graphic designer with a love for creating clean, modern designs. I specialize in branding, web design, and digital media.",
    name: "shan khan",
    profession: "Visual Graphic Designer/web designer and /Developer",
    skills: ["Affinity Photo", "Affinity Designer", "HTML", "CSS", "JavaScript", "Node js","Thumbnail designer"]
  };

  res.render("about", { aboutData });
});

app.get("/portfolio", (req, res) => {
  const portfolioData = [
    { 
      title: "Thumbnails Projects", 
      description: "A collection of thumbnail designs created for various clients.", 
      link: "/portfolio/thumbnails", 
      image: "/images/thumb1.png" 
    },
    { 
      title: "Crafting of My Mushroom", 
      description: "An illustration project for a logo concept involving a mushroom.", 
      link: "/portfolio/mushroom-logo", 
      image: "/images/mushroom_edit.png"  
    },
    { 
      title: "Web Development", 
      description: "A full-stack web development project featuring modern design and functionality.", 
      link: "/portfolio/web-development",  
      image: "/images/website.jpg"  
    }
  ];

  res.render("portfolio", { portfolioData });
});

// Portfolio detail pages
app.get("/portfolio/thumbnails", (req, res) => {
  const thumbnailsProjects = [
    { title: "Thumbnail 1", description: "This is the first thumbnail design.", image: "/images/thumb1.png" },
    { title: "Thumbnail 2", description: "This is the second thumbnail design.", image: "/images/thumb2.jpg" },
    { title: "Thumbnail 3", description: "This is the third thumbnail design.", image: "/images/thumbnail_edit.jpg" },
    { title: "Thumbnail 4", description: "This is the fourth thumbnail design.", image: "/images/property.jpg" },

  ];
  res.render("project-details", { projectData: thumbnailsProjects, projectName: "Thumbnails Projects" });
});

app.get("/portfolio/mushroom-logo", (req, res) => {
  const mushroomillustrationProjects = [
    { title: "Mushroom illustration", description: "This is the first mushroom illustration design.", image: "/images/mushroom_edit.png" },
    { title: "MGrapes design", description: "This is the Grapes  design.", image: "/images/grapes_edit11.png" },
    { title: "floral  design", description: "This is the floring  design.", image: "/images/floral_edit_v03.png" },
    { title: " Branding design", description: "This is the branding/logo  design.", image: "/images/Eco Scape edit.png" },
    { title: "wolf design", description: "This is the wolf  design.", image: "/images/Wolf_edit.png" },

  ];
  res.render("project-details", { projectData: mushroomillustrationProjects, projectName: "Crafting of My various Illustration design " });
});

app.get("/portfolio/web-development", (req, res) => {
  const webDevelopmentProjects = [
    { title: "Website 1", description: "This is the first web development project.", image: "/images/website.jpg" },
    { title: "Website 2", description: "This is the second web development project.", image: "/images/wireframe.jpg" },
  ];
  res.render("project-details", { projectData: webDevelopmentProjects, projectName: "Web Development" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { successMessage: undefined }); // This initializes with no success message.
});
app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;

// Use environment variables for sensitive data
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Using environment variable for email
    pass: process.env.EMAIL_PASS   // Using environment variable for app password
  },
  tls: {
    rejectUnauthorized: false
  }
});
  const mailOptions = {
    from: email,
    to: "baghishaan@gmail.com", // Your email to receive messages
    subject: `New message from ${name}`,
    text: `Message from: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
      return res.status(500).send("Error sending message. Please try again later.");
    }
    console.log("Email sent: " + info.response);
    // Send the success message to display after form submission
    res.render('contact', { successMessage: "Thank you for your message! We will get back to you soon." });
  });
});


// Set the port to listen
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
