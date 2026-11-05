
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Verify login and admin access
const adminOnly = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Please login first."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
};

// GET all users
router.get("/", adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch users."
    });
  }
});

// UPDATE user role
router.patch("/:id/role", adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "faculty", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid user role."
      });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "You cannot change your own role."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      message: "User role updated successfully.",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to update user role."
    });
  }
});

module.exports = router;
