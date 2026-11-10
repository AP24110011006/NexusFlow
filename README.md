# NexusFlow — Visual IoT Telemetry & Rule Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v24.14-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black.svg)](https://socket.io/)

> **Official Internship Project for Infotact Solutions**  
> **Candidate:** Koneti Manikanth  
> **Role:** Associate L1. Intern — Web Development Domain  
> **Assignment Ref. No.:** ITS/WEB/1849  
> **Duration:** 10 November 2026 – 10 December 2026 (1 Month Project Completion)  

---

## 🌟 What is NexusFlow?

**NexusFlow** is an enterprise-grade, web-based IoT telemetry monitoring platform and intelligent rule engine. It provides centralized real-time visualization of distributed IoT devices, continuously evaluates incoming sensor readings against custom user-defined conditions (`>`, `<`, `>=`, `<=`, `==`, `!=`), immediately flags anomalies via visual alerts and audio chimes, and computes historical statistical analytics.

```
+------------------+       +-------------------+       +--------------------+
|  IoT Sensor /    | ----> |  Backend Gateway  | ----> |  Rule Engine &     |
|  Simulator Node  |       |  (Express + WS)   |       |  Alert Service     |
+------------------+       +-------------------+       +--------------------+
                                                                 |
                                                                 v
                                                       +--------------------+
                                                       |  React Dashboard   |
                                                       |  (Live Recharts)   |
                                                       +--------------------+
```

---

## 🚀 Key Features & 8 Core Modules

1. **Module 1: Dashboard:**
   - Real-time KPI summaries: Connected nodes, active vs. offline devices, total alert triggers.
   - Live sensor cards with animated gauges for Temperature (°C), Humidity (%), Pressure (hPa), and Battery (%).
   - Dynamic area charts updating continuously via WebSocket streams without page reloads.

2. **Module 2: Device Management:**
   - Register, provision, edit, and remove IoT sensors.
   - Assign hardware tags (ID, MAC, IP), locations, and sensor types.
   - Live connection status indicators (`online`, `warning`, `offline`) and device status toggles.

3. **Module 3: Telemetry Management:**
   - Continuous streaming table of all incoming sensor data.
   - Built-in Manual REST Ingestion Sandbox to test custom payloads directly from the UI.
   - One-click CSV export of historical telemetry readings.

4. **Module 4: Rule Engine (The Core Engine):**
   - Visual Rule Builder with operators: `>`, `<`, `>=`, `<=`, `==`, `!=`.
   - Threshold definitions and target scopes (All Devices or individual sensor node).
   - Cooldown window enforcement to prevent alert flooding.
   - Live Rule Sandbox Evaluator: Test hypothetical readings in the browser before saving!

5. **Module 5: Alert Management:**
   - Incident response lifecycle: `Active` $\rightarrow$ `Acknowledged` $\rightarrow$ `Resolved`.
   - Priority severity levels: `Critical`, `Warning`, `Info`.
   - Web Audio API notification chimes on critical threshold breaches.

6. **Module 6: Visual Analytics:**
   - Interactive historical trends over multiple timeframes (`Past 1h`, `6h`, `24h`, `7d`).
   - Cross-device comparative bar charts (Average vs. Peak metrics).
   - Sensor performance statistics: Mean, Minimum, Maximum, Standard Deviation ($\sigma$), and Health Scores.

7. **Module 7: Event Logs:**
   - Complete audit trail of system activities, rule triggers, alert generations, and user actions.
   - Categorized by `DEVICE`, `RULE_ENGINE`, `ALERT`, `SYSTEM`, and `AUTH`.

8. **Module 8: Settings and Configuration:**
   - User profile for Koneti Manikanth (Infotact Solutions Intern credentials).
   - IoT Simulator frequency controls (1.0s to 5.0s).
   - External MQTT / LoRaWAN broker configuration settings.
   - Backend memory diagnostics and one-click Demo Data Reset.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18 (Vite), Tailwind CSS, Recharts, Lucide React, Socket.io Client, Axios.
- **Backend:** Node.js (v24), Express.js, Socket.io, JWT Authentication, Morgan.
- **Persistence:** Dual-Mode Data Store (Pluggable JSON file storage with zero external DB dependencies, plus optional MongoDB adapter).
- **Simulator:** Built-in multi-device environmental oscillation simulator with on-demand anomaly injection.

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24.14.0)
- **npm** v9+

### 2. Installation
Clone the repository and install dependencies for both backend and frontend:

```bash
# Clone the repository
git clone https://github.com/manikanth9878/NexusFlow.git
cd NexusFlow

# Install dependencies
npm run install:all
```

*(Alternatively, run `npm install` inside both `backend/` and `frontend/` folders).*

### 3. Start Backend Server
```bash
cd backend
npm start
```
The backend server runs on `http://localhost:5000` and automatically starts the IoT telemetry stream.

### 4. Start Frontend Development Server
In a separate terminal window:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Testing the Rule Engine (Instant Anomaly Demo)

To verify the Rule Engine during demonstrations or mentor evaluations:
1. Open the Dashboard at `http://localhost:5173`.
2. In the top **Simulator Control Bar**, click **"🔥 Temp Spike (46.8°C)"**.
3. **Observation:**
   - The Rule Engine evaluates `46.8°C > 40°C = TRUE`.
   - An audio chime sounds immediately.
   - A critical floating alert banner appears at the top.
   - The device card for `SENSOR_001` illuminates in red.
   - A new incident is recorded in the **Alerts** module.

---

## 📁 Repository Structure

```
NexusFlow/
├── backend/
│   ├── config/              # Configuration & environment defaults
│   ├── controllers/         # REST API controller handlers
│   ├── data/                # Data store persistence records
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Store abstraction & demo seeder
│   ├── routes/              # Express API route definitions
│   ├── services/
│   │   ├── ruleEngine.js    # Core condition evaluation engine
│   │   ├── telemetryService.js # Ingestion & broadcast logic
│   │   └── alertService.js  # Incident lifecycle manager
│   ├── simulators/          # IoT hardware telemetry simulator
│   └── server.js            # Express app & Socket.io server
├── frontend/
│   ├── public/              # Static public assets
│   └── src/
│       ├── api/             # Axios API client functions
│       ├── components/      # Reusable UI widgets & modals
│       ├── context/         # Auth & Socket.io live contexts
│       ├── layouts/         # Main layout with sticky simulator bar
│       ├── pages/           # 8 core application pages + Login
│       ├── App.jsx          # Route configurations
│       └── main.jsx         # Application root mount
├── docs/
│   ├── architecture.md      # High-level architecture & diagrams
│   ├── api-documentation.md # Complete REST API specifications
│   ├── project-report.md    # Official Infotact Solutions project report
│   └── presentation.md      # 10-slide presentation script for final defense
├── package.json             # Root monorepo scripts
├── .gitignore
├── LICENSE                  # MIT License
└── README.md
```

---

## 📚 Deliverables Checklist (Infotact Solutions)

- [x] Complete source code (Frontend + Backend + Simulator)
- [x] Comprehensive Architecture Specification ([`docs/architecture.md`](docs/architecture.md))
- [x] Complete REST API Documentation ([`docs/api-documentation.md`](docs/api-documentation.md))
- [x] Formal Internship Project Report ([`docs/project-report.md`](docs/project-report.md))
- [x] Presentation Slide Deck & Script ([`docs/presentation.md`](docs/presentation.md))
- [x] Working live demonstration with simulated multi-node telemetry stream

---

## 👤 Author & Acknowledgments

- **Developer:** Koneti Manikanth
- **Email:** manikanth9878@gmail.com | Phone: +91 7989612028
- **Role:** Associate L1. Intern (Web Development)
- **Company:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PN 560100)
- **HR Contact:** Ms. Jyotirmayee Behera (Human Resource Manager)
