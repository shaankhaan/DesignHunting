const { getDb } = require("../config/db");
const nodemailer = require("nodemailer");

// ✅ Render the Contact Page
const getContactPage = (req, res) => {
  res.render("contact", { successMessage: null, errorMessage: null });
};

// ✅ Handle Contact Form Submission
const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render("contact", {
      errorMessage: "All fields are required!",
      successMessage: null,
    });
  }

  try {
    const db = getDb();
    const contactCollection = db.collection("contactMessages");

    await contactCollection.insertOne({ name, email, message });
    console.log("✅ Contact message stored!");

    // ✅ Send Email Notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
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
        console.error("❌ Email sending error:", error);
        return res.render("contact", {
          errorMessage: "Error sending message.",
          successMessage: null,
        });
      }
      console.log("📧 Email sent:", info.response);
      res.render("contact", {
        successMessage: "Message sent successfully!",
        errorMessage: null,
      });
    });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.render("contact", {
      errorMessage: "An error occurred while sending your message.",
      successMessage: null,
    });
  }
};

module.exports = { getContactPage, submitContactForm };
