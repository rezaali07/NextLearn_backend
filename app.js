const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload"); //
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/PaymentRoute");
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); // Handles form-data (non-files)
// app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));


// Config
dotenv.config({ path: "backend/config/.env" });

// Import Routes
const user = require("./routes/UserRoute");
const payment = require("./routes/PaymentRoute");
const course = require("./routes/courseRoutes"); // <-- Uses multer
const category = require("./routes/categoryRoutes");

// Use Routes
app.use("/api/v2", user);
app.use("/api/v2", payment);
app.use("/api/v2/courses", course);
app.use("/api/v2/categories", category);
app.use("/api/v2/payment", paymentRoutes);
app.use("/api/v2/notifications", notificationRoutes);

// Error Handler
app.use(ErrorHandler);

module.exports = app;
