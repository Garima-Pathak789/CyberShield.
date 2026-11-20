const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["message", "url"],
      required: true,
      default: "message"
    },
    message: {
      type: String,
      default: ""
    },
    url: {
      type: String,
      default: ""
    },
    valid: {
      type: Boolean,
      default: true
    },
    riskLevel: {
      type: String,
      enum: ["High", "Medium", "Low", "Invalid"],
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    warnings: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Scan", scanSchema);
