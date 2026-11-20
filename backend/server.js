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

// Ensure database connection
app.use(async (req, res, next) => {
  try {
    const status = getDBStatus();
    if (!status.connected && (process.env.MONGODB_URI || process.env.VERCEL)) {
      await connectDB();
    }
  } catch (err) {
    console.error("[CyberShield Serverless] DB connect error:", err.message);
  }
  next();
});

// Health Check Endpoint (supports both /api/health and /health)
app.get(["/api/health", "/health"], (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: "ok",
    service: "CyberShield Backend API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Scan & Intelligence API Routes (mount on both /api and root for rewrite flexibility)
app.use("/api", scanRoutes);
app.use("/", scanRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server listener
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

if (require.main === module || !process.env.VERCEL) {
  startServer();
}

module.exports = app;
