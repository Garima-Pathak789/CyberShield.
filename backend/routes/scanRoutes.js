const express = require("express");
const router = express.Router();
const {
  scanMessage,
  scanUrl,
  getScans,
  getStatistics
} = require("../controllers/scanController");

router.post("/scan", scanMessage);
router.post("/scan-url", scanUrl);
router.get("/scans", getScans);
router.get("/statistics", getStatistics);

module.exports = router;
