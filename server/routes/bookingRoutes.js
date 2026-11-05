const express = require("express");
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const Lab = require("../models/Lab");

const router = express.Router();

// Authentication middleware
const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Login required" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Create booking request
router.post("/", protect, async (req, res) => {
  try {
    const { lab, bookingDate, startTime, endTime, purpose } = req.body;

    if (!lab || !bookingDate || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        message: "Please fill all booking details"
      });
    }

    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    const selectedLab = await Lab.findById(lab);

    if (!selectedLab || selectedLab.status !== "Available") {
      return res.status(400).json({
        message: "Laboratory is unavailable"
      });
    }

    const date = new Date(bookingDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid booking date"
      });
    }

    date.setUTCHours(0, 0, 0, 0);

    const existing = await Booking.find({
      lab,
      bookingDate: date,
      status: { $in: ["Pending", "Approved"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (existing.length > 0) {
      return res.status(409).json({
        message: "This time slot is already requested or booked"
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      lab,
      bookingDate: date,
      startTime,
      endTime,
      purpose
    });

    res.status(201).json({
      message: "Booking request submitted successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View own bookings (admin/faculty can view all)
router.get("/", protect, async (req, res) => {
  try {
    const filter = ["admin", "faculty"].includes(req.user.role)
      ? {}
      : { user: req.user.id };

    const bookings = await Booking.find(filter)
      .populate("user", "name email department")
      .populate("lab", "name labCode location")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject booking (faculty/admin)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (
      !["faculty", "lab_incharge"].includes(
        req.user.role?.toLowerCase()
      )
    ) {
      return res.status(403).json({
        message: "Faculty or Lab Incharge access required"
      });
    }

    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status"
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Booking has already been reviewed"
      });
    }

    if (status === "Approved") {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        lab: booking.lab,
        bookingDate: booking.bookingDate,
        status: "Approved",
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime }
      });

      if (conflict) {
        return res.status(409).json({
          message: "Another approved booking overlaps this time"
        });
      }
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: `Booking ${status.toLowerCase()} successfully`,
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel own pending booking
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can cancel only your own booking"
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled"
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
