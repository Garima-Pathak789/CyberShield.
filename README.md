# 🛡️ CyberShield – Think Before You Click. Stay Cyber Safe.

CyberShield is a full-stack cybersecurity web application designed to help users identify online scams, phishing messages, and suspicious URLs in real time. It features a dark-themed, glassmorphic security interface, rule-based threat analysis, persistent scan history stored in MongoDB, visual analytics via Recharts, and automated PDF and CSV reporting.

---

## 🌟 Key Features

1. **AI Scam Detector (Message Scanner)**
   - Analyzes raw message text against heuristic social engineering indicators.
   - Detects urgency and threats, OTP and credential requests, unexpected prizes, payment pressure, and deceptive links.
   - Calculates risk scores (0–100) and categorizes threats into High, Medium, or Low risk.
   - Provides concrete security recommendations.

2. **Advanced URL Scanner**
   - Safely parses and evaluates URL syntax without executing malicious remote code.
   - Inspects HTTPS protocol compliance, direct IP usage, suspicious domain keywords, excessive length, and credential-masquerading user info (`@`).
   - Dynamic visual risk meter indicating risk progression.

3. **Security Analytics Dashboard**
   - Real-time aggregation of Total Scans, Message Scans, URL Scans, High Risk, Medium Risk, Low Risk, and Invalid scans.
   - Categorical scan breakdown (Message vs. URL) using Recharts Bar Chart.
   - Threat distribution breakdown using Recharts Pie Chart.
   - Live server health check with status indicator (Online / Offline / Checking).

4. **Recent Activity & Scan History**
   - Quick-access recent 5 scans with filter by Message / URL.
   - Full historical audit table with text search, risk level filter, scan type filter, and ascending/descending date sorting.
   - Pagination (5 records per page).
   - One-click CSV export with sanitization against spreadsheet formula injection.

5. **Detailed Scan Report Modal**
   - Report ID with clipboard copy.
   - Scanned content preview with clipboard copy.
   - Comprehensive Threat Intelligence Analysis cards explaining each detected indicator and recommended actions.
   - Security Awareness Assistant providing simplified explanations of results.
   - Professional downloadable PDF report generated on-demand with jsPDF.

6. **Cybersecurity Learning Center & Quiz**
   - 5 in-depth security awareness modules: Phishing Awareness, Password Safety, Fake Website Detection, Payment Safety, and OTP Protection.
   - Essential cybersecurity best practices.
   - Interactive 5-question multiple-choice quiz with immediate feedback, detailed explanations, and scoring.

---

## 🏗️ Technology Stack

- **Frontend:**
  - React 18
  - Vite
  - Recharts (Interactive Dashboard Charts)
  - jsPDF (Dynamic PDF Report Generation)
  - Lucide React (Cybersecurity Icons)
  - Modern CSS3 (Dark Navy & Purple/Cyan Accents, Glassmorphism, Animations)

- **Backend:**
  - Node.js & Express.js
  - MongoDB & Mongoose
  - CORS, Dotenv, RESTful API architecture

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cluster)

### 1. MongoDB Configuration
If running MongoDB locally:
```powershell
# Start local MongoDB daemon (pointing to a local data directory):
mongod --dbpath "C:\Users\Dell\Desktop\cybershield\data\db" --bind_ip 127.0.0.1 --port 27017
```
Or configure your MongoDB Atlas URI in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cybershield
NODE_ENV=development
```

### 2. Run the Backend Server
```powershell
cd backend
npm install
npm run dev
```
The backend will run at `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

### 3. Run the Frontend Client
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and database connectivity health check |
| `POST` | `/api/scan` | Analyzes suspicious message text and stores scan record |
| `POST` | `/api/scan-url` | Analyzes URL syntax and safety indicators |
| `GET` | `/api/scans` | Returns recent scan history records |
| `GET` | `/api/statistics` | Returns aggregated metrics for the dashboard |

---

## 🛡️ License
MIT License. Built for prompt hackathons & cybersecurity education.
