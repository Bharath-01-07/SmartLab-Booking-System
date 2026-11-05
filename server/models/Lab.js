
const mongoose = require("mongoose");

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  labCode: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  labType: { type: String, required: true },
  facilities: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["Available", "Unavailable"],
    default: "Available"
  }
}, { timestamps: true });

module.exports = mongoose.model("Lab", labSchema);
