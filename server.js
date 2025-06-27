const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./db/Database");
const app = require("./app");

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Handle uncaught exceptions (synchronous errors not caught by try/catch)
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);
  process.exit(1);
});

// Connect to MongoDB
connectDatabase();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve static files from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
});

// Handle unhandled promise rejections (e.g., DB connection fails)
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED PROMISE REJECTION! Shutting down...");
  console.error(err);
  server.close(() => process.exit(1));
});

module.exports = server;
