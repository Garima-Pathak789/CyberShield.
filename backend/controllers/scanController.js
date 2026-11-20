const Scan = require("../models/Scan");
const { getDBStatus } = require("../config/db");

// In-memory / file fallback store if DB connection fails temporarily
const memoryScans = [];

// Heuristic Rules for Message Analysis
const MESSAGE_RULES = [
  {
    regex: /\b(urgent|urgently|immediate|immediately|action required|account suspended|deactivated|terminated|arrest|lawsuit|legal action|warrant|24 hours|within 24|act now|alert|compromised|unauthorized access|final notice|critical alert)\b/i,
    warning: "Urgent or threatening language detected",
    weight: 25
  },
  {
    regex: /\b(otp|one time password|password|passcode|pin|security code|cvv|credit card|debit card|bank account|routing number|ssn|social security|credentials|secret key|login details)\b/i,
    warning: "Sensitive information requested",
    weight: 35
  },
  {
    regex: /\b(won|winner|lottery|jackpot|prize|congratulations|reward|free gift|claim prize|claim your|selected to receive|cash prize|bonus payment|unclaimed money)\b/i,
    warning: "Unexpected prize or reward language detected",
    weight: 25
  },
  {
    regex: /\b(pay now|transfer money|wire transfer|overdue|unpaid invoice|late fee|penalty|send money|crypto|bitcoin|usdt|gift card|payment pending|settle debt|western union)\b/i,
    warning: "Payment pressure detected",
    weight: 25
  },
  {
    regex: /(https?:\/\/|www\.|\.xyz\b|\.top\b|\.click\b|\.club\b|bit\.ly|tinyurl\.com|t\.co|goo\.gl|[a-z0-9\-]+\.(com|net|org|io|ru|cn|cc|biz|info)\/[^\s]+)/i,
    warning: "Message contains a web link",
    weight: 20
  }
];

// Helper to save scan record to MongoDB or memory
const saveScanRecord = async (scanData) => {
  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    try {
      const scan = new Scan(scanData);
      return await scan.save();
    } catch (err) {
      console.error("[CyberShield DB] Save to MongoDB failed, falling back to local memory:", err.message);
    }
  }

  // Fallback record with simulated ObjectId and timestamps
  const fallbackRecord = {
    _id: "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    ...scanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryScans.unshift(fallbackRecord);
  return fallbackRecord;
};

// Scan Message Controller
exports.scanMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message to scan."
      });
    }

    const trimmedMessage = message.trim();
    const warnings = [];
    let score = 0;

    for (const rule of MESSAGE_RULES) {
      if (rule.regex.test(trimmedMessage)) {
        warnings.push(rule.warning);
        score += rule.weight;
      }
    }

    // Clamp score 0 - 100
    const riskScore = Math.min(100, Math.max(0, warnings.length === 0 ? 5 : score));

    let riskLevel = "Low";
    if (riskScore >= 60) {
      riskLevel = "High";
    } else if (riskScore >= 25) {
      riskLevel = "Medium";
    }

    let recommendation = "";
    if (riskLevel === "High") {
      recommendation = "Do not respond to this message, avoid clicking any links, and never share passwords, OTPs, or financial information. Verify the sender through official channels.";
    } else if (riskLevel === "Medium") {
      recommendation = "Proceed with caution. Verify the sender's identity through trusted contact channels before clicking links or taking any requested actions.";
    } else {
      recommendation = "No obvious threat indicators were found by heuristic checks. However, always exercise normal security caution before sharing personal data.";
    }

    const scanData = {
      type: "message",
      message: trimmedMessage,
      valid: true,
      riskLevel,
      riskScore,
      warnings,
      recommendation
    };

    const savedScan = await saveScanRecord(scanData);

    return res.status(200).json({
      success: true,
      scan: savedScan
    });
  } catch (error) {
    next(error);
  }
};

// Scan URL Controller
exports.scanUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a URL to scan."
      });
    }

    const trimmedUrl = url.trim();

    // Check URL validity and protocol
    let parsedUrl;
    let isValid = true;
    try {
      parsedUrl = new URL(trimmedUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        isValid = false;
      }
    } catch {
      isValid = false;
    }

    if (!isValid) {
      const invalidData = {
        type: "url",
        url: trimmedUrl,
        valid: false,
        riskLevel: "Invalid",
        riskScore: 100,
        warnings: ["Invalid URL format. Must start with http:// or https://"],
        recommendation: "Please enter a valid, well-formed URL starting with http:// or https://."
      };

      const savedInvalid = await saveScanRecord(invalidData);
      return res.status(200).json({
        success: true,
        result: savedInvalid
      });
    }

    const warnings = [];
    let score = 0;

    // Check 1: HTTPS availability
    if (parsedUrl.protocol !== "https:") {
      warnings.push("Website does not use HTTPS");
      score += 30;
    }

    // Check 2: IP address based host
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(parsedUrl.hostname) || parsedUrl.hostname.startsWith("[") || parsedUrl.hostname === "localhost") {
      warnings.push("URL uses an IP address instead of a domain name");
      score += 35;
    }

    // Check 3: Potentially misleading words found in domain
    const suspiciousDomainKeywords = /(login|signin|verify|verification|secure|security|account|update|banking|authenticate|auth|wallet|free|gift|support|service|portal|paypa1|micros0ft|app1e|g00gle|recovery|recover)/i;
    // Check if suspicious keyword appears in subdomain or domain label
    const hostnameParts = parsedUrl.hostname.split(".");
    const hasSuspiciousWord = suspiciousDomainKeywords.test(parsedUrl.hostname) || suspiciousDomainKeywords.test(parsedUrl.pathname);
    if (hasSuspiciousWord) {
      warnings.push("Potentially misleading words found in domain");
      score += 25;
    }

    // Check 4: Unusually long URL (> 75 chars)
    if (trimmedUrl.length > 75) {
      warnings.push("Unusually long URL");
      score += 20;
    }

    // Check 5: Potentially misleading user information syntax (e.g., http://google.com@evil.com)
    if (parsedUrl.username || trimmedUrl.includes("@")) {
      warnings.push("URL contains potentially misleading user information");
      score += 35;
    }

    const riskScore = Math.min(100, Math.max(0, warnings.length === 0 ? 5 : score));

    let riskLevel = "Low";
    if (riskScore >= 60) {
      riskLevel = "High";
    } else if (riskScore >= 30) {
      riskLevel = "Medium";
    }

    let recommendation = "";
    if (riskLevel === "High") {
      recommendation = "High risk detected. Avoid interacting with this URL, do not enter any credentials, and verify the domain through official sources.";
    } else if (riskLevel === "Medium") {
      recommendation = "Some suspicious indicators were detected. Exercise caution and verify the website before submitting sensitive details.";
    } else {
      recommendation = "Few suspicious indicators detected by these checks. Continue with standard browsing hygiene.";
    }

    const scanData = {
      type: "url",
      url: trimmedUrl,
      valid: true,
      riskLevel,
      riskScore,
      warnings,
      recommendation
    };

    const savedScan = await saveScanRecord(scanData);

    return res.status(200).json({
      success: true,
      result: savedScan
    });
  } catch (error) {
    next(error);
  }
};

// Get All Scans (Scan History & Recent Activity)
exports.getScans = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    let scans = [];

    if (dbStatus.connected) {
      scans = await Scan.find().sort({ createdAt: -1 }).limit(100).lean();
    } else {
      scans = [...memoryScans];
    }

    return res.status(200).json({
      success: true,
      count: scans.length,
      scans
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    let scans = [];

    if (dbStatus.connected) {
      scans = await Scan.find().lean();
    } else {
      scans = [...memoryScans];
    }

    const totalScans = scans.length;
    const messageScans = scans.filter((s) => !s.url || s.type === "message").length;
    const urlScans = scans.filter((s) => Boolean(s.url) || s.type === "url").length;
    const highRisk = scans.filter((s) => s.riskLevel === "High").length;
    const mediumRisk = scans.filter((s) => s.riskLevel === "Medium").length;
    const lowRisk = scans.filter((s) => s.riskLevel === "Low").length;
    const invalidScans = scans.filter((s) => s.riskLevel === "Invalid").length;

    return res.status(200).json({
      success: true,
      statistics: {
        totalScans,
        messageScans,
        urlScans,
        highRisk,
        mediumRisk,
        lowRisk,
        invalidScans
      }
    });
  } catch (error) {
    next(error);
  }
};
