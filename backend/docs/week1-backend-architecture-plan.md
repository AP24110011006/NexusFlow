# NexusFlow — Week 1 Backend Architecture & Engineering Plan
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship Role:** Backend Lead / Associate L1. Intern  
**Author:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Date:** November 2026 — Week 1 Milestone  

---

## 1. Executive Architecture Overview

NexusFlow's backend is engineered around a reactive, high-throughput Node.js micro-architecture designed to ingest continuous time-series sensor telemetry, evaluate user-defined dynamic threshold rules in memory, persist state to durable storage, and fan out live event streams via WebSockets to connected dashboards.

```
       [ IoT Device / Gateway / Simulator ]
                         │
                         ▼ HTTP POST /api/telemetry (JSON)
       ┌────────────────────────────────────────────────────────┐
       │                NexusFlow Express Server                │
       │                                                        │
       │  ┌─────────────────┐       ┌──────────────────────┐   │
       │  │ Ingestion &     │ ----> │ Memory Store / JSON  │   │
       │  │ Sanitization    │       │ Persistence (store)  │   │
       │  └────────┬────────┘       └──────────────────────┘   │
       │           │                                            │
       │           ▼                                            │
       │  ┌─────────────────┐       ┌──────────────────────┐   │
       │  │ Dynamic Rule    │ ----> │ Alert Dispatch &     │   │
       │  │ Evaluator (O(R))│       │ Event Logging        │   │
       │  └────────┬────────┘       └──────────┬───────────┘   │
       └───────────┼───────────────────────────┼────────────────┘
                   │                           │
                   ▼                           ▼
       ┌────────────────────────────────────────────────────────┐
       │             Socket.IO Real-Time Stream Engine          │
       │      telemetry:new                   alert:new         │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
                         [ Frontend Dashboard ]
```

---

## 2. Ingestion Pipeline & Event Loop Model

### 2.1 Single-Threaded Asynchronous Non-Blocking I/O
The Node.js event loop handles concurrency without thread-per-request overhead:
1. **Network Phase:** Incoming telemetry payloads are parsed by `express.json()` middleware with strict byte limits (500KB) to prevent Denial of Service (DoS) attacks.
2. **Sanitization Phase:** Schema validation verifies mandatory identifiers (`deviceId`), bounded numeric ranges (`temperature`, `humidity`, `pressure`), and attaches canonical ISO 8601 timestamps.
3. **Execution Phase:** In-memory queue dispatches readings directly to the `ruleEngine.evaluateTelemetry(reading)` service synchronously before write flushing.
4. **WebSocket Fanout Phase:** `io.emit('telemetry:new', reading)` broadcasts the sanitized record to all active dashboard subscribers within `< 15ms` of arrival.

---

## 3. Rule Engine Algorithmic Complexity

The rule engine evaluates incoming data packets against $R$ active rules configured for a specific device:
- **Lookup Complexity:** $O(1)$ device rule index partitioning.
- **Evaluation Complexity:** $O(R_d)$ where $R_d$ is the number of active rules attached to device $d$. For typical industrial installations ($R_d \le 50$), evaluation takes under `0.5ms` per telemetry packet.
- **Supported Operators:**
  - `>` (Strictly Greater Than)
  - `<` (Strictly Less Than)
  - `>=` (Greater Than or Equal)
  - `<=` (Less Than or Equal)
  - `==` (Equality with numeric epsilon tolerance)
  - `!=` (Inequality)
- **Hysteresis & Cooldown:** To prevent alert floods when a reading oscillates around a threshold (e.g. 40.01°C, 39.99°C, 40.02°C), a sliding-window debounce interval (default: 60 seconds) suppresses redundant alerts for the same condition.

---

## 4. Storage Architecture & Persistence Strategy

- **Development/Internship Phase:** Fast ACID-compliant file-backed in-memory store (`backend/models/store.js`) ensuring zero external cloud database dependencies during local evaluation and demonstration.
- **Production Roadmap:** Ready for seamless drop-in adaptation to PostgreSQL / TimescaleDB for time-series partitioning and MongoDB for flexible dynamic rule predicates.

---

## 5. Security & Authentication Model

- **JWT Stateless Authentication:** Implemented via `jsonwebtoken` (`backend/middleware/authMiddleware.js`).
- **Role-Based Access Control (RBAC):** Distinction between `admin` (can configure hardware IDs and mutate rules) and `viewer` (read-only telemetry and chart visualization).
- **CORS Protection:** Configured with origin filtering in `backend/config/config.js`.

---

## 6. Week 1 Backend Deliverables Checklist

- [x] REST API endpoints (`/api/devices`, `/api/telemetry`, `/api/rules`, `/api/alerts`, `/api/logs`, `/api/analytics`, `/api/settings`)
- [x] Automated IoT Sensor Simulator with adjustable tick frequencies and drift models
- [x] Unit test suite for Rule Engine boundary conditions (`backend/tests/ruleEngine.test.js`)
- [x] Postman API Collection export (`backend/docs/postman_collection.json`)
- [x] Database Schema Specification (`backend/docs/database-schema.md`)
- [x] REST API Contract Specification (`backend/docs/api-contracts-week1.md`)
- [x] Synthetic Telemetry Data Seeder (`backend/scripts/seed-mock-telemetry.js`)
