# NexusFlow — CI/CD Automation & Containerization Strategy
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 1 — DevOps & Continuous Integration Planning  

---

## 1. Overview & Automation Pipeline

To ensure zero regressions across parallel team development, NexusFlow enforces automated Continuous Integration via GitHub Actions on every pull request and branch push.

```
[ Developer Git Push (manikanth / likhitha / harshitha) ]
                          │
                          ▼
             ┌─────────────────────────┐
             │   GitHub Actions (CI)   │
             └────────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
 ┌──────────────────────┐    ┌──────────────────────┐
 │  Backend Job (Node)  │    │  Frontend Job (Vite) │
 │  • Rule Engine Tests │    │  • Module Transform  │
 │  • Validation Tests  │    │  • Tailwind CSS Gen  │
 │  • Integration Tests │    │  • Production Build  │
 │  • Health Diagnostic │    │  • Asset Size Check  │
 └──────────────────────┘    └──────────────────────┘
            │                           │
            └─────────────┬─────────────┘
                          │
                          ▼
            [ Automated Status Check: PASS ]
                          │
                          ▼
            [ Pull Request Ready to Merge ]
```

---

## 2. Containerization Architecture (`docker-compose.yml`)

NexusFlow is containerized into microservices to ensure identical behavior in local development, staging, and production environments:

### 2.1 Backend Service (`nexusflow-backend`)
- **Base Image:** `node:20-alpine` (Minimal attack surface, < 120MB image)
- **Port Binding:** `5000:5000` (HTTP REST & Socket.IO WebSockets)
- **Persistent Volume:** Mounts `./backend/data` for JSON state persistence across container restarts.

### 2.2 Frontend Service (`nexusflow-frontend`)
- **Base Image:** Multi-stage build (`node:20-alpine` builder $\to$ `nginx:alpine` static server)
- **Port Binding:** `5173:80`
- **Reverse Proxy:** Nginx routes API and WebSocket requests seamlessly to the backend service container.

---

## 3. Automated Test Suite Registry

| Test Suite | File Path | Scope | Target Threshold |
|---|---|---|---|
| Rule Engine Unit Tests | `backend/tests/ruleEngine.test.js` | 6 relational operators & sandbox | 8/8 Tests (100%) |
| Telemetry Validation Tests | `backend/tests/telemetryValidation.test.js` | Sanitization, bounds, missing IDs | 6/6 Tests (100%) |
| End-to-End Integration | `backend/tests/integration.test.js` | Ingestion $\to$ Rule $\to$ Alert $\to$ Resolve | 3/3 Tests (100%) |
| System Health Diagnostic | `backend/scripts/health-check.js` | 7 JSON storage files & runtime memory | 100% OK |
