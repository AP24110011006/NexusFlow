# NexusFlow — Backend Environment Setup & Developer Guide
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship Role:** Backend Lead / Associate L1. Intern  
**Author:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 1 — Development Environment Standardization  

---

## 1. Prerequisites

Before setting up the NexusFlow backend, ensure your workstation meets the following prerequisites:
- **Node.js:** v18.0.0 or higher (v20+ recommended, tested on v24)
- **NPM:** v9.0.0 or higher
- **Git:** v2.35 or higher
- **Operating System:** Windows 10/11, macOS 12+, or Ubuntu 22.04 LTS

---

## 2. Quick-Start Setup Instructions

### 2.1 Repository Cloning & Navigation
```bash
git clone https://github.com/AP24110011006/NexusFlow.git
cd NexusFlow/backend
```

### 2.2 Installing Dependencies
```bash
npm install
```
Installed core packages:
- `express` (^4.19.2): High-performance HTTP application framework.
- `cors` (^2.8.5): Cross-Origin Resource Sharing middleware.
- `socket.io` (^4.7.5): Real-time bi-directional event transport.
- `uuid` (^9.0.1): Cryptographic RFC4122 UUID generator.
- `jsonwebtoken` (^9.0.2): Stateless HMAC-SHA256 JWT security tokens.

### 2.3 Configuration Environment File
Copy the reference environment template:
```bash
cp ../.env.example .env
```
Default parameters configured in `.env`:
- `PORT=5000`
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:5173`
- `JWT_SECRET=nexusflow-secure-token-2026`
- `SIMULATOR_INTERVAL_MS=3000`

---

## 3. Available Operational Scripts

| Command | Action |
|---|---|
| `npm start` | Boots the Express server and begins background IoT sensor simulation on port 5000. |
| `node tests/ruleEngine.test.js` | Executes the 8-suite automated unit test suite for condition predicates. |
| `node scripts/seed-mock-telemetry.js` | Generates 120 synthetic telemetry data points with deliberate anomalies. |
| `node scripts/health-check.js` | Runs comprehensive storage integrity and engine diagnostic checks. |

---

## 4. Troubleshooting Common Issues

### Port 5000 Already in Use
If port 5000 is occupied by another process:
```bash
# Windows PowerShell
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```
Or change `PORT=5001` in your `.env` file.
