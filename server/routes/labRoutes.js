
const express = require("express");
const Lab = require("../models/Lab");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Check admin access
const adminOnly = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Login required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all laboratories
router.get("/", async (req, res) => {
  try {
    const labs = await Lab.find();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new laboratory (Admin only)
router.post("/", adminOnly, async (req, res) => {
  try {
    const lab = await Lab.create(req.body);
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update laboratory (Admin only)
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete laboratory (Admin only)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const lab = await Lab.findByIdAndDelete(req.params.id);

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json({ message: "Laboratory deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
