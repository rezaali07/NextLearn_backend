const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");


// Import admin routes for exams/levels/programs
const adminExamRoutes = require("./routes/adminExamRoutes");
const userExamRoutes = require("./routes/userExamRoutes");

// Load environment variables
dotenv.config({ path: "backend/config/.env" });

//AI 
const aiRoutes = require("./routes/aiRoutes");

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// =======================
// Import Routes
// =======================
const user = require("./routes/UserRoute");
const payment = require("./routes/PaymentRoute");
const course = require("./routes/courseRoutes");
const category = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/PaymentRoute");
const notificationRoutes = require("./routes/notificationRoutes");
const globalSettingRoutes = require("./routes/globalSettingRoute");

// Newly added college-related routes
const collegeRoutes = require("./routes/collegeRoutes");
const collegeCategoryRoutes = require("./routes/collegeCategoryRoutes");
const collegeProgramRoutes = require("./routes/collegeProgramRoutes");

// =======================
// Use Routes
// =======================
app.use("/api/v2", user);
app.use("/api/v2", payment);
app.use("/api/v2/courses", course);
app.use("/api/v2/categories", category);
app.use("/api/v2/payment", paymentRoutes);
app.use("/api/v2/notifications", notificationRoutes);
app.use("/api", globalSettingRoutes);

// College Management Routes
app.use("/api/v2/colleges", collegeRoutes);
app.use("/api/v2/college-categories", collegeCategoryRoutes);
app.use("/api/v2/college-programs", collegeProgramRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//exams
app.use("/api/admin/exams", adminExamRoutes);
app.use("/api/user/exams", userExamRoutes);

//AI
app.use("/api/ai", aiRoutes);


// =======================
// Error Handling
// =======================
app.use(ErrorHandler);

module.exports = app;
