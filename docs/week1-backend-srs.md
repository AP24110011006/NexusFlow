# Software Requirements Specification (SRS) — Week 1 Backend Telemetry Engine
**Project Name:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship Role:** Backend Lead / Associate L1. Intern  
**Author:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Client / Evaluator:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Project Duration:** 10 November 2026 – 10 December 2026 (One Month Milestone)  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification document describes the functional, operational, and non-functional requirements for the Week 1 Backend Architecture of the NexusFlow platform. It serves as the formal baseline for IoT telemetry ingestion, real-time threshold condition evaluation, alert notification dispatch, and RESTful query services.

### 1.2 Scope
NexusFlow addresses the industrial challenge of monitoring hundreds of IoT devices simultaneously. The backend eliminates manual sensor tracking by ingesting raw data, evaluating automated rule predicates, and broadcasting critical alerts to operators within milliseconds.

---

## 2. Functional Requirements (FR)

### FR-01: Device Management
- The system shall provide endpoints to register new IoT sensor devices with metadata (`id`, `name`, `type`, `location`, `status`, `ipAddress`, `macAddress`).
- The system shall automatically update the `lastSeen` timestamp whenever a device submits telemetry.
- The system shall support querying active and inactive device lists.

### FR-02: Telemetry Ingestion Pipeline
- The system shall accept HTTP `POST` requests at `/api/telemetry` containing sensor metrics (`temperature`, `humidity`, `pressure`, `battery`, `rssi`, `timestamp`).
- The system shall validate inbound payloads and reject packets missing mandatory fields with HTTP 400.
- The system shall append valid records to the time-series store with indexed timestamps.

### FR-03: Rule Engine Evaluation
- The system shall maintain user-defined operational rules containing:
  - Metric identifier (`temperature`, `humidity`, `pressure`, `battery`)
  - Relational operator (`>`, `<`, `>=`, `<=`, `==`, `!=`)
  - Target threshold value (floating point or integer)
  - Severity level (`low`, `medium`, `high`, `critical`)
- The system shall evaluate every inbound telemetry packet against applicable active rules.
- If a condition evaluates to `TRUE`, the system shall generate an alert record and emit an instant WebSocket event.

### FR-04: Alert Generation & Cooldown
- The system shall log alerts with status (`active`, `acknowledged`, `resolved`).
- The system shall prevent alert flapping by applying a configurable debounce cooldown window.

### FR-05: Real-Time Event Fanout
- The system shall maintain persistent WebSocket connections with active client browsers.
- Upon telemetry ingestion or alert generation, updates shall be pushed to clients via Socket.IO events (`telemetry:new`, `alert:new`, `device:status`).

---

## 3. Non-Functional Requirements (NFR)

### NFR-01: Latency & Throughput
- Ingestion processing time (from HTTP packet receive to database persistence) shall not exceed 25ms under nominal load.
- WebSocket fanout propagation delay shall remain below 50ms on local networks.

### NFR-02: Reliability & Zero-Crash Resiliency
- Unhandled sensor payload exceptions shall be caught by error-handling middleware without terminating the Node.js process.
- The persistence layer shall recover gracefully from corrupted or unformatted JSON files by rebuilding default states.

### NFR-03: Maintainability & Testability
- Core business logic (Rule Engine condition evaluator) shall be decoupled from HTTP transport layers and verified via automated unit test suites (`npm test`).

---

## 4. Acceptance Criteria — Week 1 Milestone

| Item | Requirement | Verification Method | Status |
|---|---|---|---|
| AC-1 | Ingestion endpoint accepts sensor payloads | Automated Postman & curl tests | PASSED |
| AC-2 | Rule Engine evaluates 6 comparison operators | Node.js Jest/Assertion Unit Test Suite | PASSED |
| AC-3 | Alert dispatch on threshold breach | Synthetic seeder & WebSocket listener | PASSED |
| AC-4 | Device online/offline auto-detection | Simulator heartbeat monitor | PASSED |
| AC-5 | Complete REST API contract documentation | Technical review by team leads | PASSED |
