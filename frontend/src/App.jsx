import { useState, useEffect } from "react";
import "./App.css";
import { jsPDF } from "jspdf";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  HelpCircle,
  Activity,
  Globe,
  MessageSquare,
  FileText,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Info
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [statistics, setStatistics] = useState({
    totalScans: 0,
    messageScans: 0,
    urlScans: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    invalidScans: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serverStatus, setServerStatus] = useState("Checking...");

  // Scan History Search & Filters
  const [historySearch, setHistorySearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [historySort, setHistorySort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const scansPerPage = 5;
  const [scanTypeFilter, setScanTypeFilter] = useState("All");
  const [recentActivityFilter, setRecentActivityFilter] = useState("All");

  // Message Scanner States
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scans, setScans] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // URL Scanner States
  const [url, setUrl] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Modal & Assistant States
  const [selectedScan, setSelectedScan] = useState(null);
  const [assistantExplanation, setAssistantExplanation] = useState("");
  const [copyStatus, setCopyStatus] = useState({ id: false, content: false });

  // Quiz Tracking States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quizQuestions = [
    {
      question: "1. You receive a message asking for your bank OTP. What should you do?",
      options: [
        "Share the OTP",
        "Ignore the warning",
        "Never share the OTP",
        "Forward it to a friend"
      ],
      correctAnswer: "Never share the OTP",
      explanation: "An OTP is a private verification code. Sharing it can allow someone else to access your account."
    },
    {
      question: "2. Which password is generally the strongest?",
      options: [
        "123456",
        "password",
        "Garima123",
        "T9@kL#82pQ!"
      ],
      correctAnswer: "T9@kL#82pQ!",
      explanation: "A strong password should be unique and difficult to guess. Avoid using personal information."
    },
    {
      question: "3. What should you do before clicking an unfamiliar link?",
      options: [
        "Click immediately",
        "Verify its destination",
        "Share it publicly",
        "Enter your password"
      ],
      correctAnswer: "Verify its destination",
      explanation: "Checking an unfamiliar link before using it helps you avoid phishing and misleading websites."
    },
    {
      question: "4. What does HTTPS indicate?",
      options: [
        "A secured connection",
        "A guaranteed safe website",
        "A free website",
        "A government website"
      ],
      correctAnswer: "A secured connection",
      explanation: "HTTPS encrypts the connection between your browser and a website, but it does not guarantee that the website itself is trustworthy."
    },
    {
      question: "5. What should you do if you receive an unexpected prize message?",
      options: [
        "Pay the processing fee",
        "Share your bank details",
        "Verify the offer independently",
        "Share the message with everyone"
      ],
      correctAnswer: "Verify the offer independently",
      explanation: "Unexpected prize messages may be scams. Verify offers through the organization's official channels."
    }
  ];

  // Handle Message Scan
  const handleScan = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message to scan!");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Scan failed.");
      }

      setResult(data.scan);
      fetchHistory();
      fetchStatistics();
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Scan History
  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/scans`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load history.");
      }

      setScans(data.scans || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("History Error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Dashboard Statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/statistics`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Statistics Error:", error);
    }
  };

  // Check Backend Server Status
  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`);

      if (response.ok) {
        setServerStatus("Online");
      } else {
        setServerStatus("Offline");
      }
    } catch (error) {
      setServerStatus("Offline");
    }
  };

  // Download Scan Report as PDF
  const downloadReport = () => {
    if (!selectedScan) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("CyberShield Scan Report", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Think Before You Click. Stay Cyber Safe.", 20, 27);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 33);
    doc.text(`Report ID: ${selectedScan._id || "N/A"}`, 20, 39);

    doc.setDrawColor(203, 213, 225);
    doc.line(20, 43, 190, 43);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text(
      `Scan Type: ${selectedScan.url ? "URL Scan" : "Message Scan"}`,
      20,
      52
    );

    const content = selectedScan.url || selectedScan.message || "N/A";
    doc.text("Scanned Content:", 20, 62);

    const contentLines = doc.splitTextToSize(content, 170);
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text(contentLines, 20, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 70 + contentLines.length * 6 + 6;

    doc.text(`Risk Level: ${selectedScan.riskLevel}`, 20, y);
    y += 8;

    doc.text(`Risk Score: ${selectedScan.riskScore}/100`, 20, y);
    y += 12;

    doc.text("Detected Warnings:", 20, y);
    y += 8;

    const warnings =
      selectedScan.warnings && selectedScan.warnings.length
        ? selectedScan.warnings
        : ["No suspicious indicators detected."];

    warnings.forEach((warning) => {
      const lines = doc.splitTextToSize(`• ${warning}`, 170);

      if (y + lines.length * 6 > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, 20, y);
      y += lines.length * 6;
    });

    y += 8;

    const recommendation = doc.splitTextToSize(
      `Recommendation: ${selectedScan.recommendation}`,
      170
    );

    if (y + recommendation.length * 6 > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(recommendation, 20, y);

    doc.save(`CyberShield-Scan-Report-${selectedScan._id ? selectedScan._id.slice(-6) : "export"}.pdf`);
  };

  // Export Scan History as CSV
  const exportScanHistory = () => {
    if (scans.length === 0) {
      alert("No scan history available to export.");
      return;
    }

    const headers = [
      "Date",
      "Scan Type",
      "Scanned Content",
      "Risk Level",
      "Risk Score",
      "Warnings",
      "Recommendation"
    ];

    const rows = scans.map((scan) => [
      new Date(scan.createdAt).toLocaleString(),
      scan.url ? "URL Scan" : "Message Scan",
      scan.url || scan.message,
      scan.riskLevel,
      scan.riskScore,
      scan.warnings ? scan.warnings.join("; ") : "",
      scan.recommendation
    ]);

    // Prevent spreadsheet formula injection
    const escapeCSV = (value) => {
      let text = String(value ?? "");

      if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    // Convert scan history into CSV
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "CyberShield_Scan_History.csv";
    link.click();

    URL.revokeObjectURL(downloadUrl);
  };

  // Security Awareness Assistant
  const generateExplanation = () => {
    if (!selectedScan) return;

    const risk = selectedScan.riskLevel;
    const warnings = selectedScan.warnings || [];

    let explanation = "";

    if (risk === "High") {
      explanation =
        "This scan has detected several suspicious indicators. " +
        "Avoid clicking links or sharing personal information. " +
        "Verify the sender or website through official channels.";
    } else if (risk === "Medium") {
      explanation =
        "This scan has detected some warning signs. " +
        "Be careful and independently verify the request " +
        "before taking any action.";
    } else if (risk === "Invalid") {
      explanation =
        "The entered URL could not be validated. " +
        "Check the URL format before proceeding.";
    } else {
      explanation =
        "No major suspicious patterns were detected by these checks. " +
        "However, this does not guarantee that the content is safe. " +
        "Always verify unfamiliar messages and websites.";
    }

    const warningText = warnings.length
      ? warnings.join(", ")
      : "No specific warning indicators detected.";

    setAssistantExplanation(
      `Risk Level: ${risk}\n\n` +
      `Detected Indicators: ${warningText}\n\n` +
      `Explanation: ${explanation}`
    );
  };

  // Threat Intelligence Analysis
  const getThreatIntelligence = () => {
    if (!selectedScan) return [];

    const threatInfo = {
      "Urgent or threatening language detected": {
        title: "Urgency-Based Manipulation",
        details: "The content uses urgency or threats to pressure the recipient.",
        action: "Pause and independently verify the request."
      },

      "Sensitive information requested": {
        title: "Sensitive Information Request",
        details: "The content may be requesting passwords, OTPs or financial details.",
        action: "Never share these details through messages or unverified websites."
      },

      "Unexpected prize or reward language detected": {
        title: "Unexpected Reward Indicator",
        details: "Unexpected prizes or rewards can be used to attract victims.",
        action: "Verify the offer through the organization's official website."
      },

      "Payment pressure detected": {
        title: "Payment Pressure",
        details: "The content creates pressure to make a payment.",
        action: "Verify the payment request independently before proceeding."
      },

      "Message contains a web link": {
        title: "Link Detected",
        details: "The message contains a web link that may require verification.",
        action: "Check the destination carefully. Do not open unfamiliar links."
      },

      "Website does not use HTTPS": {
        title: "HTTPS Not Detected",
        details: "The website uses a connection that does not provide HTTPS encryption.",
        action: "Avoid entering sensitive information on this website."
      },

      "URL uses an IP address instead of a domain name": {
        title: "IP-Based Website Address",
        details: "The website address uses an IP address instead of a conventional domain name.",
        action: "Verify the website through its official source."
      },

      "Potentially misleading words found in domain": {
        title: "Suspicious Domain Wording",
        details: "The domain contains words sometimes used in misleading website addresses.",
        action: "Check the exact domain name before trusting the website."
      },

      "Unusually long URL": {
        title: "Unusually Long URL",
        details: "The URL is longer than the configured detection threshold.",
        action: "Verify the destination before using the link."
      },

      "URL contains potentially misleading user information": {
        title: "Potentially Misleading URL Structure",
        details: "The URL contains user-information syntax that can make its destination confusing.",
        action: "Avoid using the link until its destination is independently verified."
      }
    };

    const warnings = selectedScan.warnings || [];
    return warnings.map((warning) => ({
      warning,
      ...(threatInfo[warning] || {
        title: "Unclassified Indicator",
        details: "This indicator needs further review.",
        action: "Verify the content through a trusted source."
      })
    }));
  };

  useEffect(() => {
    fetchHistory();
    fetchStatistics();
    checkServerStatus();

    const statusInterval = setInterval(() => {
      checkServerStatus();
    }, 10000);

    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [historySearch, riskFilter, scanTypeFilter, historySort]);

  // URL Scan Function
  const handleURLScan = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a URL to scan!");
      return;
    }

    // Validate URL format
    try {
      const parsedURL = new URL(url.trim());

      if (
        parsedURL.protocol !== "http:" &&
        parsedURL.protocol !== "https:"
      ) {
        throw new Error("Invalid protocol");
      }
    } catch {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setUrlLoading(true);
    setUrlResult(null);
    setUrlError("");

    try {
      const response = await fetch(`${API_BASE}/api/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "URL scan failed.");
      }

      setUrlResult(data.result);
      fetchHistory();
      fetchStatistics();
    } catch (err) {
      setUrlError(err.message || "Unable to connect to the server.");
    } finally {
      setUrlLoading(false);
    }
  };

  // Filter Scan History
  const filteredScans = scans.filter((scan) => {
    const searchText = historySearch.toLowerCase();

    const matchesSearch =
      (scan.message || "").toLowerCase().includes(searchText) ||
      (scan.url || "").toLowerCase().includes(searchText) ||
      (scan.riskLevel || "").toLowerCase().includes(searchText);

    const matchesRisk =
      riskFilter === "All" || scan.riskLevel === riskFilter;

    const matchesType =
      scanTypeFilter === "All" ||
      (scanTypeFilter === "Message" && !scan.url) ||
      (scanTypeFilter === "URL" && !!scan.url);

    return matchesSearch && matchesRisk && matchesType;
  });

  // Sort Scan History
  const sortedScans = [...filteredScans].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    return historySort === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  // Pagination Logic
  const indexOfLastScan = currentPage * scansPerPage;
  const indexOfFirstScan = indexOfLastScan - scansPerPage;

  const currentScans = sortedScans.slice(
    indexOfFirstScan,
    indexOfLastScan
  );

  const totalPages = Math.max(1, Math.ceil(sortedScans.length / scansPerPage));

  // Dynamic Chart Data based on current scans or statistics
  const totalScans = scans.length;
  const messageScans = scans.filter((scan) => !scan.url).length;
  const urlScans = scans.filter((scan) => scan.url).length;
  const highRisk = scans.filter((scan) => scan.riskLevel === "High").length;
  const mediumRisk = scans.filter((scan) => scan.riskLevel === "Medium").length;
  const lowRisk = scans.filter((scan) => scan.riskLevel === "Low").length;
  const invalidScans = scans.filter((scan) => scan.riskLevel === "Invalid").length;

  const scanComparisonData = [
    { name: "Messages", scans: statistics.messageScans || messageScans },
    { name: "URLs", scans: statistics.urlScans || urlScans }
  ];

  const riskDistributionData = [
    { name: "High Risk", value: statistics.highRisk || highRisk },
    { name: "Medium Risk", value: statistics.mediumRisk || mediumRisk },
    { name: "Low Risk", value: statistics.lowRisk || lowRisk },
    { name: "Invalid", value: statistics.invalidScans || invalidScans }
  ];

  const chartColors = ["#ef4444", "#f59e0b", "#22c55e", "#64748b"];

  const recentActivityScans = scans
    .filter((scan) => {
      if (recentActivityFilter === "Message") {
        return !scan.url;
      }
      if (recentActivityFilter === "URL") {
        return Boolean(scan.url);
      }
      return true;
    })
    .slice(0, 5);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyStatus((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  return (
    <div className="app">
      {/* Background Glow Accents */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo-badge">
            <Shield className="brand-icon" />
          </div>
          <h2>CyberShield</h2>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#features">Features</a>
          <a href="#scanner">Scanner</a>
          <a href="#url-scanner">URL Scanner</a>
          <a href="#recent-activity">Recent Activity</a>
          <a href="#history">History</a>
          <a href="#learning-center">Learning Center</a>
          <a href="#cyber-quiz">Cyber Quiz</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-right">
          <div className="server-status">
            <span
              className={`status-dot ${
                serverStatus === "Online"
                  ? "online"
                  : serverStatus === "Checking..."
                  ? "checking"
                  : "offline"
              }`}
            ></span>
            <span className="status-label">Server: <strong>{serverStatus}</strong></span>
          </div>

          <a href="#learning-center" className="nav-btn">
            <ShieldCheck size={16} /> Stay Safe
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="tag-pill">
            <Sparkles size={14} className="tag-icon" />
            <span className="tag">YOUR DIGITAL SAFETY PARTNER</span>
          </div>

          <h1>
            Think Before You Click.
            <span className="gradient-text"> Stay Cyber Safe.</span>
          </h1>

          <p className="hero-desc">
            Protect yourself from online scams, phishing
            messages and suspicious links with CyberShield,
            your digital safety assistant.
          </p>

          <div className="hero-actions">
            <a href="#scanner" className="main-btn primary-glow">
              <MessageSquare size={18} />
              Scan a Message →
            </a>
            <a href="#url-scanner" className="main-btn secondary-btn">
              <Globe size={18} />
              Scan a URL →
            </a>
          </div>

          <div className="hero-stats-strip">
            <div className="strip-item">
              <ShieldCheck size={18} className="strip-icon" />
              <span>Real-Time Heuristics</span>
            </div>
            <div className="strip-divider"></div>
            <div className="strip-item">
              <Lock size={18} className="strip-icon" />
              <span>Zero-Execution URL Inspection</span>
            </div>
            <div className="strip-divider"></div>
            <div className="strip-item">
              <Activity size={18} className="strip-icon" />
              <span>Instant Risk Scoring</span>
            </div>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="shield-card-glow">
            <div className="shield-radar"></div>
            <div className="shield-icon-wrapper">
              <Shield className="hero-shield-svg" />
            </div>
            <h3>Your Safety, Our Priority</h3>
            <p className="hero-card-sub">Secure • Smart • Simple</p>
            <div className="shield-indicators">
              <span className="pill-active">Anti-Phishing Active</span>
              <span className="pill-protected">Engine v2.4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scanner Section */}
      <section className="scanner-section" id="scanner">
        <div className="section-header">
          <div className="tag-pill">
            <MessageSquare size={14} className="tag-icon" />
            <span className="tag">SMART PROTECTION</span>
          </div>
          <h2>AI Scam Detector</h2>
          <p className="section-subtitle">
            Paste a suspicious message below to check it for phishing, urgency manipulation, and credential theft indicators.
          </p>
        </div>

        <div className="scanner-card">
          <form onSubmit={handleScan}>
            <div className="textarea-container">
              <textarea
                placeholder="Paste your suspicious message here... (e.g. 'URGENT: Your bank account is locked. Click http://bit.ly/bank-auth to verify your OTP immediately.')"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setResult(null);
                  setError("");
                }}
                rows={5}
              />
            </div>

            <div className="scanner-footer">
              <span className="char-count">{message.length} characters</span>
              <button
                type="submit"
                className="main-btn primary-glow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" /> Analyzing Message...
                  </>
                ) : (
                  <>
                    <Search size={18} /> 🔍 Scan Message
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="result error-result">
              <div className="result-header">
                <AlertTriangle size={20} className="error-icon" />
                <h3>Scan Error</h3>
              </div>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="result success-result">
              <div className="result-top">
                <div className="result-status-title">
                  <CheckCircle size={22} className="success-icon" />
                  <h3>Scan Completed!</h3>
                </div>
                <span className={`risk-badge large ${result.riskLevel?.toLowerCase()}`}>
                  {result.riskLevel} Risk
                </span>
              </div>

              <div className="risk-metric-box">
                <div className="metric-text">
                  <span>Risk Score</span>
                  <strong>{result.riskScore} / 100</strong>
                </div>
                <div className="risk-meter">
                  <div
                    className="risk-meter-fill"
                    style={{
                      width: `${result.riskScore}%`,
                      background:
                        result.riskLevel === "High"
                          ? "#ef4444"
                          : result.riskLevel === "Medium"
                          ? "#f59e0b"
                          : "#22c55e"
                    }}
                  ></div>
                </div>
              </div>

              <div className="warnings-block">
                <h4>Detected Warnings:</h4>
                {result.warnings && result.warnings.length > 0 ? (
                  <ul className="warning-list">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>
                        <AlertTriangle size={16} className="warning-bullet" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="clean-notice">
                    <ShieldCheck size={16} /> No suspicious indicators detected.
                  </p>
                )}
              </div>

              <div className="recommendation-block">
                <h4>Security Recommendation:</h4>
                <p>{result.recommendation}</p>
              </div>

              <div className="method-disclaimer">
                <Info size={14} />
                <span>
                  <strong>Methodology Notice:</strong> Analysis is powered by rule-based heuristic pattern matching against known social-engineering signals. Heuristics are not a 100% guarantee; always verify unfamiliar messages independently.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* URL Scanner Section */}
      <section className="scanner-section" id="url-scanner">
        <div className="section-header">
          <div className="tag-pill">
            <Globe size={14} className="tag-icon" />
            <span className="tag">LINK SAFETY CHECK</span>
          </div>
          <h2>Advanced URL Scanner</h2>
          <p className="section-subtitle">
            Enter a website URL to inspect protocol security, host legitimacy, and deceptive domain patterns without executing malicious content.
          </p>
        </div>

        <div className="scanner-card">
          <form onSubmit={handleURLScan}>
            <div className="input-group">
              <Globe size={20} className="input-icon" />
              <input
                type="text"
                placeholder="https://example.com/login"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlResult(null);
                  setUrlError("");
                }}
                maxLength={2048}
                required
              />
            </div>

            <div className="scanner-footer">
              <span className="url-tip">Safe static analysis — no external visits made</span>
              <button
                type="submit"
                className="main-btn primary-glow"
                disabled={urlLoading}
              >
                {urlLoading ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" /> Analyzing URL...
                  </>
                ) : (
                  <>
                    <ExternalLink size={18} /> 🔗 Scan URL
                  </>
                )}
              </button>
            </div>
          </form>

          {urlError && (
            <div className="result error-result">
              <div className="result-header">
                <AlertTriangle size={20} className="error-icon" />
                <h3>URL Scan Error</h3>
              </div>
              <p>{urlError}</p>
            </div>
          )}

          {urlResult && (
            <div className="result success-result">
              <div className="result-top">
                <div className="result-status-title">
                  {urlResult.valid ? (
                    <CheckCircle size={22} className="success-icon" />
                  ) : (
                    <XCircle size={22} className="error-icon" />
                  )}
                  <h3>{urlResult.valid ? "URL Analysis Complete" : "Invalid URL"}</h3>
                </div>
                <span className={`risk-badge large ${urlResult.riskLevel?.toLowerCase()}`}>
                  {urlResult.riskLevel} Risk
                </span>
              </div>

              {urlResult.valid && (
                <div className="risk-metric-box">
                  <div className="metric-text">
                    <span>Risk Score</span>
                    <strong>{urlResult.riskScore} / 100</strong>
                  </div>
                  <div className="risk-meter">
                    <div
                      className="risk-meter-fill"
                      style={{
                        width: `${urlResult.riskScore}%`,
                        background:
                          urlResult.riskLevel === "High"
                            ? "#ef4444"
                            : urlResult.riskLevel === "Medium"
                            ? "#f59e0b"
                            : "#22c55e"
                      }}
                    ></div>
                  </div>
                  <p className="risk-summary-text">
                    {urlResult.riskScore >= 60
                      ? "High risk detected. Avoid interacting with this URL."
                      : urlResult.riskScore >= 30
                      ? "Some suspicious indicators detected. Verify carefully."
                      : "Few suspicious indicators detected by these checks."}
                  </p>
                </div>
              )}

              <div className="warnings-block">
                <h4>Warnings:</h4>
                {urlResult.warnings && urlResult.warnings.length > 0 ? (
                  <ul className="warning-list">
                    {urlResult.warnings.map((warning, index) => (
                      <li key={index}>
                        <AlertTriangle size={16} className="warning-bullet" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="clean-notice">
                    <ShieldCheck size={16} /> No suspicious patterns detected by these checks.
                  </p>
                )}
              </div>

              <div className="recommendation-block">
                <h4>Recommendation:</h4>
                <p>{urlResult.recommendation}</p>
              </div>

              <div className="method-disclaimer">
                <Info size={14} />
                <span>
                  <strong>Note:</strong> These are static heuristic and pattern checks, not an absolute guarantee that a website is safe.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Analytics */}
      <section className="features-section" id="dashboard">
        <div className="section-header">
          <div className="tag-pill">
            <Activity size={14} className="tag-icon" />
            <span className="tag">SECURITY OVERVIEW</span>
          </div>
          <h2>CyberShield Dashboard</h2>
          <p className="section-subtitle">Real-time threat intelligence and scan statistics</p>

          <div className="dashboard-controls">
            <button
              className="main-btn refresh-btn"
              onClick={() => {
                fetchStatistics();
                fetchHistory();
              }}
            >
              <RefreshCw size={16} /> 🔄 Refresh Dashboard
            </button>
            <span className="last-updated">
              Last Updated:{" "}
              <strong>
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "Not updated yet"}
              </strong>
            </span>
          </div>
        </div>

        <div className="feature-grid stats-grid">
          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper blue">
              <Activity size={24} />
            </div>
            <div className="stat-details">
              <h3>📊 Total Scans</h3>
              <h2>{statistics.totalScans}</h2>
              <p>Combined analyses</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper purple">
              <MessageSquare size={24} />
            </div>
            <div className="stat-details">
              <h3>💬 Message Scans</h3>
              <h2>{statistics.messageScans}</h2>
              <p>Total messages analyzed</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper cyan">
              <Globe size={24} />
            </div>
            <div className="stat-details">
              <h3>🔗 URL Scans</h3>
              <h2>{statistics.urlScans}</h2>
              <p>Total URLs analyzed</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-details">
              <h3>🔴 High Risk</h3>
              <h2>{statistics.highRisk}</h2>
              <p>High-risk detections</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper orange">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-details">
              <h3>🟠 Medium Risk</h3>
              <h2>{statistics.mediumRisk}</h2>
              <p>Medium-risk detections</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper green">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-details">
              <h3>🟢 Low Risk</h3>
              <h2>{statistics.lowRisk}</h2>
              <p>Low-risk detections</p>
            </div>
          </div>

          <div className="feature-card stat-card">
            <div className="stat-icon-wrapper slate">
              <XCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>⚠️ Invalid URLs</h3>
              <h2>{statistics.invalidScans}</h2>
              <p>Invalid URL entries</p>
            </div>
          </div>
        </div>

        {/* Charts & Visualizations */}
        <div className="charts-grid">
          {/* Risk Distribution Progress Bars */}
          <div className="feature-card chart-card">
            <div className="chart-header">
              <h3>📈 Risk Distribution</h3>
              <span className="chart-badge">Volume</span>
            </div>

            <div className="risk-bar-group">
              <div className="risk-bar-label">
                <span>High Risk</span>
                <strong>{statistics.highRisk}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="risk-bar high-bar"
                  style={{
                    width: `${
                      statistics.totalScans
                        ? (statistics.highRisk / statistics.totalScans) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>

            <div className="risk-bar-group">
              <div className="risk-bar-label">
                <span>Medium Risk</span>
                <strong>{statistics.mediumRisk}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="risk-bar medium-bar"
                  style={{
                    width: `${
                      statistics.totalScans
                        ? (statistics.mediumRisk / statistics.totalScans) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>

            <div className="risk-bar-group">
              <div className="risk-bar-label">
                <span>Low Risk</span>
                <strong>{statistics.lowRisk}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="risk-bar low-bar"
                  style={{
                    width: `${
                      statistics.totalScans
                        ? (statistics.lowRisk / statistics.totalScans) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Scan Comparison Bar Chart */}
          <div className="feature-card chart-card">
            <div className="chart-header">
              <h3>📊 Message vs URL Scans</h3>
              <span className="chart-badge">Categorical</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scanComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Legend />
                <Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Scans" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution Pie Chart */}
          <div className="feature-card chart-card">
            <div className="chart-header">
              <h3>🥧 Threat Proportions</h3>
              <span className="chart-badge">Share</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                  label
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Scan Activity */}
      <section className="features-section" id="recent-activity">
        <div className="section-header">
          <div className="tag-pill">
            <Activity size={14} className="tag-icon" />
            <span className="tag">LATEST UPDATES</span>
          </div>
          <h2>Recent Scan Activity</h2>
          <p className="activity-count">
            Showing {recentActivityScans.length} recent scan(s)
          </p>

          <div className="activity-filters">
            <button
              className={recentActivityFilter === "All" ? "active" : ""}
              onClick={() => setRecentActivityFilter("All")}
            >
              All Scans
            </button>
            <button
              className={recentActivityFilter === "Message" ? "active" : ""}
              onClick={() => setRecentActivityFilter("Message")}
            >
              Message Scans
            </button>
            <button
              className={recentActivityFilter === "URL" ? "active" : ""}
              onClick={() => setRecentActivityFilter("URL")}
            >
              URL Scans
            </button>
            <button
              className="clear-filter-btn"
              onClick={() => setRecentActivityFilter("All")}
            >
              Clear Filters
            </button>
          </div>

          <div className="recent-top-actions">
            <button
              className="main-btn refresh-btn"
              onClick={fetchHistory}
              disabled={historyLoading}
            >
              <RefreshCw size={16} className={historyLoading ? "spin-icon" : ""} />
              {historyLoading ? "Refreshing..." : "↻ Refresh Activity"}
            </button>
            {lastUpdated && (
              <span className="last-updated">
                Last refreshed: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="feature-grid">
          {historyLoading ? (
            <div className="feature-card full-width-card">
              <RefreshCw size={24} className="spin-icon" />
              <p>Loading recent scan activity...</p>
            </div>
          ) : recentActivityScans.length === 0 ? (
            <div className="feature-card full-width-card">
              <Info size={24} />
              <p>
                {recentActivityFilter === "Message"
                  ? "No message scans found."
                  : recentActivityFilter === "URL"
                  ? "No URL scans found."
                  : "No scan activity available yet."}
              </p>
            </div>
          ) : (
            recentActivityScans.map((scan) => (
              <div className="feature-card activity-card" key={scan._id}>
                <div className="activity-card-top">
                  <span className="scan-type-tag">
                    {scan.url ? "🔗 URL Scan" : "💬 Message Scan"}
                  </span>
                  <span className={`risk-badge ${scan.riskLevel?.toLowerCase()}`}>
                    {scan.riskLevel}
                  </span>
                </div>

                <div className="scanned-snippet" title={scan.url || scan.message}>
                  <code>{scan.url || scan.message || "Scan record"}</code>
                </div>

                <div className="risk-score-row">
                  <span>Risk Score:</span>
                  <strong>{scan.riskScore}/100</strong>
                </div>

                <div className="risk-progress">
                  <div
                    className={`risk-progress-fill ${scan.riskLevel?.toLowerCase()}`}
                    style={{ width: `${scan.riskScore}%` }}
                  ></div>
                </div>

                <div className="card-footer-action">
                  <button
                    className="main-btn view-details-btn"
                    onClick={() => {
                      setSelectedScan(scan);
                      setAssistantExplanation("");
                    }}
                  >
                    View Details
                  </button>
                  <small className="date-text">
                    {scan.createdAt
                      ? new Date(scan.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="view-all-container">
          <a href="#history" className="main-btn secondary-btn">
            View All Scans →
          </a>
        </div>
      </section>

      {/* Scan History Section */}
      <section className="features-section" id="history">
        <div className="section-header">
          <div className="tag-pill">
            <FileText size={14} className="tag-icon" />
            <span className="tag">YOUR ACTIVITY</span>
          </div>
          <h2>Scan History</h2>
          <p className="history-count">
            Showing {filteredScans.length} of {scans.length} scans
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="history-controls-bar">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="history-search"
              placeholder="🔍 Search by message, URL or risk level..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="dropdowns-wrap">
            <select
              className="risk-filter custom-select"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Invalid">Invalid</option>
            </select>

            <select
              className="scan-type-filter custom-select"
              value={scanTypeFilter}
              onChange={(e) => setScanTypeFilter(e.target.value)}
            >
              <option value="All">All Scans</option>
              <option value="Message">Message Scans</option>
              <option value="URL">URL Scans</option>
            </select>

            <select
              className="history-sort custom-select"
              value={historySort}
              onChange={(e) => setHistorySort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              className="clear-filter-btn"
              onClick={() => {
                setHistorySearch("");
                setRiskFilter("All");
                setScanTypeFilter("All");
                setHistorySort("newest");
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="action-btns-wrap">
            <button
              className="main-btn refresh-btn"
              onClick={fetchHistory}
              disabled={historyLoading}
            >
              <RefreshCw size={16} className={historyLoading ? "spin-icon" : ""} />
              {historyLoading ? "Loading..." : "🔄 Refresh History"}
            </button>

            <button
              className="main-btn export-btn"
              onClick={exportScanHistory}
              disabled={scans.length === 0}
            >
              <Download size={16} /> 📥 Export Scan History (CSV)
            </button>
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="feature-card empty-state">
            <Info size={32} />
            <p>No previous scans match your search criteria.</p>
          </div>
        ) : (
          <div className="feature-grid history-grid">
            {currentScans.map((scan) => (
              <div className="feature-card history-card" key={scan._id}>
                <div className="history-card-header">
                  <span className="scan-type-tag">
                    {scan.url ? "🔗 URL Scan" : "💬 Message Scan"}
                  </span>
                  <span className={`risk-badge ${scan.riskLevel?.toLowerCase()}`}>
                    {scan.riskLevel} Risk
                  </span>
                </div>

                <p className="history-score">
                  <strong>Risk Score:</strong>{" "}
                  <span className="score-val">{scan.riskScore}/100</span>
                </p>

                <div className="history-content-box">
                  <strong>{scan.url ? "Scanned URL:" : "Message:"}</strong>
                  <div className="content-text-scroll">
                    {scan.url || scan.message}
                  </div>
                </div>

                <p className="history-date">
                  <strong>Date:</strong> {new Date(scan.createdAt).toLocaleString()}
                </p>

                <div className="history-recommendation">
                  <strong>Recommendation:</strong>
                  <p>{scan.recommendation}</p>
                </div>

                <button
                  className="main-btn report-open-btn"
                  onClick={() => {
                    setSelectedScan(scan);
                    setAssistantExplanation("");
                  }}
                >
                  <FileText size={16} /> 📄 View Detailed Report
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="page-indicator">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Detailed Report Modal */}
        {selectedScan && (
          <div className="report-modal-overlay" onClick={() => setSelectedScan(null)}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <Shield className="modal-shield-icon" />
                  <h2>CyberShield Scan Report</h2>
                </div>
                <button
                  className="modal-close-icon-btn"
                  onClick={() => setSelectedScan(null)}
                >
                  ✕
                </button>
              </div>

              <div className="report-content">
                {/* Report ID & Copy */}
                <div className="report-info-row">
                  <div>
                    <span className="info-title">Report ID:</span>
                    <code className="report-id-text">{selectedScan._id}</code>
                  </div>
                  <button
                    className="main-btn icon-btn"
                    onClick={() => copyToClipboard(selectedScan._id, "id")}
                  >
                    <Copy size={16} />
                    {copyStatus.id ? "Copied!" : "📋 Copy Report ID"}
                  </button>
                </div>

                {/* Scan Type */}
                <div className="report-info-row">
                  <div>
                    <span className="info-title">Scan Type:</span>
                    <strong>{selectedScan.url ? "URL Scan" : "Message Scan"}</strong>
                  </div>
                </div>

                {/* Scanned Content & Copy */}
                <div className="report-content-section">
                  <div className="section-title-action">
                    <span className="info-title">Scanned Content:</span>
                    <button
                      className="main-btn icon-btn"
                      onClick={() =>
                        copyToClipboard(selectedScan.url || selectedScan.message, "content")
                      }
                    >
                      <Copy size={16} />
                      {copyStatus.content ? "Copied!" : "📋 Copy Scanned Content"}
                    </button>
                  </div>
                  <div className="content-preview-box">
                    <code>{selectedScan.url || selectedScan.message}</code>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="modal-section-card">
                  <h3>Risk Assessment</h3>
                  <div className="assessment-row">
                    <span className={`risk-badge large ${selectedScan.riskLevel?.toLowerCase()}`}>
                      {selectedScan.riskLevel} Risk
                    </span>
                    <span className="assessment-score">
                      <strong>Risk Score:</strong> {selectedScan.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Detected Warnings */}
                <div className="modal-section-card">
                  <h3>Detected Warnings</h3>
                  {selectedScan.warnings && selectedScan.warnings.length > 0 ? (
                    <ul className="modal-warning-list">
                      {selectedScan.warnings.map((warning, index) => (
                        <li key={index}>
                          <AlertTriangle size={16} className="modal-warning-icon" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="clean-notice">
                      <ShieldCheck size={16} /> No suspicious indicators detected.
                    </p>
                  )}
                </div>

                {/* Threat Intelligence Section */}
                <div className="threat-intelligence">
                  <h3>🔍 Threat Intelligence Analysis</h3>
                  {getThreatIntelligence().length > 0 ? (
                    <div className="threat-grid">
                      {getThreatIntelligence().map((threat, index) => (
                        <div className="threat-card" key={index}>
                          <h4>{threat.title}</h4>
                          <p>
                            <strong>Detected Indicator:</strong> {threat.warning}
                          </p>
                          <p>
                            <strong>Analysis:</strong> {threat.details}
                          </p>
                          <p className="threat-action">
                            <strong>Recommended Action:</strong> {threat.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="clean-notice">
                      No threat indicators were detected by the current heuristic rules.
                    </p>
                  )}
                </div>

                {/* Security Recommendation */}
                <div className="modal-section-card">
                  <h3>Security Recommendation</h3>
                  <p className="rec-text">{selectedScan.recommendation}</p>
                </div>

                {/* Security Awareness Assistant */}
                <div className="assistant-section">
                  <div className="assistant-header">
                    <ShieldCheck size={20} className="assistant-icon" />
                    <h3>🛡️ Security Awareness Assistant</h3>
                  </div>
                  <p>
                    Want to understand why this scan received its risk score?
                  </p>
                  <button
                    className="main-btn assistant-btn"
                    onClick={generateExplanation}
                  >
                    🤖 Explain Scan Result
                  </button>

                  {assistantExplanation && (
                    <div className="assistant-result">
                      <h4>Scan Explanation</h4>
                      <pre className="explanation-text">{assistantExplanation}</pre>
                    </div>
                  )}
                </div>

                <div className="modal-footer-date">
                  <small>
                    <strong>Scan Date:</strong>{" "}
                    {new Date(selectedScan.createdAt).toLocaleString()}
                  </small>
                </div>

                <div className="modal-actions-bar">
                  <button className="main-btn primary-glow" onClick={downloadReport}>
                    <Download size={16} /> 📥 Download PDF Report
                  </button>
                  <button
                    className="main-btn secondary-btn"
                    onClick={() => setSelectedScan(null)}
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Security Awareness Learning Center */}
      <section id="learning-center" className="learning-section">
        <div className="section-header">
          <div className="tag-pill">
            <BookOpen size={14} className="tag-icon" />
            <span className="tag">SECURITY EDUCATION</span>
          </div>
          <h2>📚 Security Awareness Learning Center</h2>
          <p className="section-subtitle">
            Learn how to identify common online threats and stay safe online.
          </p>
        </div>

        <div className="feature-grid learning-grid">
          <div className="feature-card learning-card">
            <div className="card-top-icon blue">🎣</div>
            <h3>Phishing Awareness</h3>
            <p>
              Learn to recognize suspicious messages, fake emails, urgency manipulation, and misleading links designed to steal credentials.
            </p>
          </div>

          <div className="feature-card learning-card">
            <div className="card-top-icon purple">🔐</div>
            <h3>Password Safety</h3>
            <p>
              Understand strong passwords, avoid password reuse across websites, and use modern password managers and multi-factor authentication.
            </p>
          </div>

          <div className="feature-card learning-card">
            <div className="card-top-icon cyan">🌐</div>
            <h3>Fake Website Detection</h3>
            <p>
              Learn how to identify typosquatting domains, verify SSL/TLS certificates, and check website URLs before submitting login details.
            </p>
          </div>

          <div className="feature-card learning-card">
            <div className="card-top-icon orange">💳</div>
            <h3>Payment Safety</h3>
            <p>
              Understand safe digital payment gateways, spot fake invoice attachments, and avoid unverified peer-to-peer money transfers.
            </p>
          </div>

          <div className="feature-card learning-card">
            <div className="card-top-icon green">📱</div>
            <h3>OTP Protection</h3>
            <p>
              Learn why one-time passwords and verification codes are strictly private. Legitimate organizations will never ask for your OTP.
            </p>
          </div>
        </div>

        {/* Daily Cybersecurity Tips */}
        <div className="security-tips">
          <div className="tips-header">
            <ShieldCheck size={22} className="tips-icon" />
            <h3>🛡️ Essential Cybersecurity Tips</h3>
          </div>

          <div className="tips-grid">
            <div className="tip-card">
              <h4>🔐 Protect Your Accounts</h4>
              <p>Use unique passwords and enable two-factor authentication on all sensitive services.</p>
            </div>

            <div className="tip-card">
              <h4>📩 Beware of Phishing</h4>
              <p>Verify unexpected messages before clicking links or downloading unexpected email attachments.</p>
            </div>

            <div className="tip-card">
              <h4>🌐 Browse Safely</h4>
              <p>Check website addresses carefully before entering personal credentials or financial details.</p>
            </div>

            <div className="tip-card">
              <h4>💳 Make Safe Payments</h4>
              <p>Never share your OTP, PIN or banking credentials with anyone over calls, chats, or emails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity Quiz */}
      <section id="cyber-quiz" className="quiz-section">
        <div className="section-header">
          <div className="tag-pill">
            <Award size={14} className="tag-icon" />
            <span className="tag">TEST YOUR KNOWLEDGE</span>
          </div>
          <h2>🧠 Cybersecurity Knowledge Quiz</h2>
          <p className="section-subtitle">
            Put your cybersecurity skills to the test with these practical everyday safety scenarios.
          </p>
        </div>

        <div className="quiz-card">
          {!quizFinished ? (
            <>
              <div className="quiz-step-header">
                <span className="quiz-step-label">
                  Question <strong>{currentQuestion + 1}</strong> of <strong>{quizQuestions.length}</strong>
                </span>
                <span className="quiz-score-indicator">Current Score: {quizScore}</span>
              </div>

              <div className="quiz-progress">
                <div
                  className="quiz-progress-fill"
                  style={{
                    width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`
                  }}
                ></div>
              </div>

              <h3 className="quiz-question-title">{quizQuestions[currentQuestion].question}</h3>

              <div className="quiz-options-grid">
                {quizQuestions[currentQuestion].options.map((option, index) => {
                  const isSelected = quizAnswer === option;
                  const isCorrect = option === quizQuestions[currentQuestion].correctAnswer;

                  let optionClass = "quiz-option";
                  if (isSelected) optionClass += " selected";
                  if (quizSubmitted) {
                    if (isCorrect) optionClass += " correct";
                    else if (isSelected && !isCorrect) optionClass += " incorrect";
                  }

                  return (
                    <button
                      key={index}
                      className={optionClass}
                      onClick={() => {
                        if (!quizSubmitted) setQuizAnswer(option);
                      }}
                      disabled={quizSubmitted}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="opt-text">{option}</span>
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <div className="quiz-action-bar">
                  <button
                    className="main-btn primary-glow"
                    disabled={!quizAnswer}
                    onClick={() => {
                      if (quizAnswer === quizQuestions[currentQuestion].correctAnswer) {
                        setQuizScore((prev) => prev + 1);
                      }
                      setQuizSubmitted(true);
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className="quiz-feedback-box">
                  <div className="feedback-result">
                    {quizAnswer === quizQuestions[currentQuestion].correctAnswer ? (
                      <span className="feedback-badge success">
                        <CheckCircle size={18} /> ✅ Correct Answer!
                      </span>
                    ) : (
                      <span className="feedback-badge error">
                        <XCircle size={18} /> ❌ Incorrect! Correct answer:{" "}
                        {quizQuestions[currentQuestion].correctAnswer}
                      </span>
                    )}
                  </div>

                  <div className="quiz-explanation">
                    <h4>💡 Learn More</h4>
                    <p>{quizQuestions[currentQuestion].explanation}</p>
                  </div>

                  <button
                    className="main-btn primary-glow next-q-btn"
                    onClick={() => {
                      if (currentQuestion + 1 < quizQuestions.length) {
                        setCurrentQuestion((prev) => prev + 1);
                        setQuizAnswer("");
                        setQuizSubmitted(false);
                      } else {
                        setQuizFinished(true);
                      }
                    }}
                  >
                    {currentQuestion + 1 === quizQuestions.length
                      ? "View Final Score →"
                      : "Next Question →"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="quiz-complete-card">
              <div className="complete-badge-icon">🎉</div>
              <h3>Quiz Completed!</h3>
              <h2>
                Your Score: <span className="score-highlight">{quizScore}</span> /{" "}
                {quizQuestions.length}
              </h2>

              <p className="quiz-summary-verdict">
                {quizScore === 5
                  ? "Outstanding! You have strong cybersecurity awareness and sharp threat detection instincts."
                  : quizScore >= 3
                  ? "Good effort! You understand core fundamentals, but keep sharpening your cybersecurity vigilance."
                  : "Keep learning! Review the Learning Center tips above to improve your digital defense skills."}
              </p>

              <button
                className="main-btn primary-glow"
                onClick={() => {
                  setCurrentQuestion(0);
                  setQuizAnswer("");
                  setQuizSubmitted(false);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
              >
                <RefreshCw size={16} /> Restart Quiz
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="tag-pill">
            <Layers size={14} className="tag-icon" />
            <span className="tag">WHAT WE OFFER</span>
          </div>
          <h2>Explore CyberShield</h2>
          <p className="section-subtitle">
            Comprehensive defense mechanisms designed to protect everyday internet users.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card highlight-card">
            <div className="card-top-icon blue">📩</div>
            <h3>Scam Detection</h3>
            <p>
              Identify suspicious messages, urgency patterns, prize scams, and potential online fraud attempts before you reply.
            </p>
          </div>

          <div className="feature-card highlight-card">
            <div className="card-top-icon purple">🔗</div>
            <h3>Link Awareness</h3>
            <p>
              Inspect unfamiliar URLs and domain structures to recognize typosquatting, lack of HTTPS, and suspicious IP targets safely.
            </p>
          </div>

          <div className="feature-card highlight-card">
            <div className="card-top-icon cyan">🤖</div>
            <h3>AI Assistant</h3>
            <p>
              Receive clear, plain-language explanations of why certain messages or links are risky and actionable steps to stay safe.
            </p>
          </div>

          <div className="feature-card highlight-card">
            <div className="card-top-icon green">📚</div>
            <h3>Cyber Learning</h3>
            <p>
              Improve your cybersecurity awareness with practical tutorials, essential habits, and interactive knowledge checks.
            </p>
          </div>

          <div className="feature-card highlight-card">
            <div className="card-top-icon orange">📊</div>
            <h3>Risk Analysis</h3>
            <p>
              Gain full transparency into how risk scores are calculated using categorized heuristic threat indicators.
            </p>
          </div>

          <div className="feature-card highlight-card">
            <div className="card-top-icon slate">🕒</div>
            <h3>Scan History</h3>
            <p>
              Keep track of your historical checks, filter past activities, search previous scans, and export audit logs to CSV.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section" id="about">
        <div className="section-header">
          <div className="tag-pill">
            <Info size={14} className="tag-icon" />
            <span className="tag">SIMPLE WORKFLOW</span>
          </div>
          <h2>How CyberShield Works</h2>
          <p className="section-subtitle">Four simple steps to verify suspicious digital communications</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h4>Paste Content</h4>
            <p>Paste a suspicious SMS, email, chat message, or website link into CyberShield.</p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <h4>Analyze Threats</h4>
            <p>Our heuristic engine inspects syntax, domain legitimacy, protocol security, and social engineering cues.</p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <h4>Understand Risk</h4>
            <p>Review the calculated risk score (0-100), detected warning flags, and threat intelligence explanations.</p>
          </div>

          <div className="step-card">
            <div className="step-num">04</div>
            <h4>Stay Protected</h4>
            <p>Follow expert security recommendations, download audit reports, and keep your accounts secure.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Shield className="brand-icon" />
              <h2>CyberShield</h2>
            </div>
            <p className="footer-tagline">Think Before You Click. Stay Cyber Safe.</p>
          </div>

          <div className="footer-nav">
            <a href="#home">Home</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#scanner">Scanner</a>
            <a href="#url-scanner">URL Scanner</a>
            <a href="#learning-center">Learning Center</a>
            <a href="#cyber-quiz">Quiz</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CyberShield | Cybersecurity Defense Platform</p>
          <p className="footer-sub">Stay vigilant. Never share passwords or OTPs with unverified sources.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
