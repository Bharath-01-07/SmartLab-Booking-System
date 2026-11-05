const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const labRoutes = require("./routes/labRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Smart Laboratory Booking System API Running");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
