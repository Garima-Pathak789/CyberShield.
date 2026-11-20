require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDBStatus } = require("./config/db");
const scanRoutes = require("./routes/scanRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: "ok",
    service: "CyberShield Backend API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Scan & Intelligence API Routes
app.use("/api", scanRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🛡️  CyberShield Backend Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
};

startServer();
