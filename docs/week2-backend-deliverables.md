# NexusFlow — Week 2 Backend Deliverables Comprehensive Report
**Project Name:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship Role:** Backend Lead / Associate L1. Intern  
**Author:** Koneti Manikanth (Ref. No.: `ITS/WEB/1849`)  
**Client / Evaluator:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Milestone Period:** Week 2 (17 November 2026 – 24 November 2026)  
**Supervisor / HR:** Ms. Jyotirmayee Behera (HR Manager)

---

## 1. Executive Summary

During **Week 2**, the backend engineering roadmap advanced from baseline ingestion and rule evaluation into **Enterprise Integration, Memory-Bounded Streaming Buffering, Gateway Traffic Throttling, and Cryptographic Security Hardening**.

To support mission-critical industrial deployments, the backend now provides:
1. Event-driven **Webhook Notifications** with HMAC-SHA256 non-repudiation.
2. In-memory **Circular Ring Buffering** with $O(1)$ cyclic overwrite ensuring zero heap memory leaks during telemetry bursts.
3. High-throughput **Batch Telemetry Ingestion** accepting up to 500 readings per request.
4. Sliding-window **Rate Limiting & Throttling** protecting against DDoS attacks and anomalous edge sensor retry loops with canonical HTTP 429 response backoff.
5. **32 / 32 automated backend tests (100% pass rate)** spanning unit, integration, and security test suites.

---

## 2. Key Deliverables & Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
|                                NexusFlow Week 2 Backend Architecture                              |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Inbound IoT Sensor Traffic ]                                                                    |
|              |                                                                                    |
|              v                                                                                    |
|  +---------------------------+                                                                    |
|  | Sliding-Window Throttle   | ---> [ Over Limit ] ---> HTTP 429 (Retry-After, RateLimit Headers) |
|  | (throttleService.js)      |                                                                    |
|  +---------------------------+                                                                    |
|              |                                                                                    |
|         [ Allowed ]                                                                               |
|              v                                                                                    |
|  +---------------------------+       +----------------------------+                               |
|  | Circular Ring Buffer      | <---> | Batch Ingestion Gateway    |                               |
|  | (bufferService.js)        |       | (/api/telemetry/batch)     |                               |
|  +---------------------------+       +----------------------------+                               |
|              |                                                                                    |
|              v                                                                                    |
|  +---------------------------+       +----------------------------+                               |
|  | Rule Engine Evaluation    | ----> | Webhook Dispatcher         | ---> External Alert Sinks     |
|  | (ruleEngine.js)           | [Trip]| (webhookService.js)        |      (Slack, SCADA, SMS)       |
|  +---------------------------+       | HMAC-SHA256 Signature      |                               |
|                                      +----------------------------+                               |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Breakdown

### 3.1 External Webhook Dispatcher Service (`backend/services/webhookService.js`)
- **Event-Driven Dispatch:** Automatically dispatches JSON alerts to registered webhook endpoints upon critical or warning threshold breaches.
- **Cryptographic Authentication:** Every outgoing payload is hashed using HMAC-SHA256 with the device's shared secret and transmitted via the `X-NexusFlow-Signature` HTTP header.
- **Sandbox Testing:** Provides `testWebhook(url, secret)` allowing operators to verify third-party receiver readiness before activating alert rules.
- **Unit Tests:** Verified by 5 automated tests in `backend/tests/webhookService.test.js`.
- **Documentation:** [`backend/docs/week2-webhook-integration-guide.md`](file:///c:/NexusFlow/backend/docs/week2-webhook-integration-guide.md).

### 3.2 In-Memory Circular Ring Buffer & Batch Ingestion (`backend/services/bufferService.js`)
- **Memory Ceiling Enforcement:** Bounded fixed-capacity cyclic array per device, eliminating heap memory bloat during high-frequency ingestion spikes.
- **$O(1)$ Cyclic Overwrite:** Newest readings replace oldest readings instantly with zero array reallocation overhead.
- **Batch Processing API:** Ingests arrays of sensor packets at `/api/telemetry/batch`, parsing, validating, and buffering in a single atomic transaction.
- **Unit Tests:** Verified by 5 automated tests in `backend/tests/bufferService.test.js`.
- **Documentation:** [`backend/docs/week2-telemetry-buffering-architecture.md`](file:///c:/NexusFlow/backend/docs/week2-telemetry-buffering-architecture.md) & [`backend/docs/week2-batch-ingestion-api.md`](file:///c:/NexusFlow/backend/docs/week2-batch-ingestion-api.md).

### 3.3 Sliding-Window Rate Limiter & Throttle Service (`backend/services/throttleService.js`)
- **Rolling Window Traffic Regulation:** Uses millisecond-accurate timestamp logs to calculate true rolling traffic without the 2x burst vulnerability of fixed-window counters.
- **Per-Device Capacity Tiers:** Custom overrides allow high-frequency vibration nodes (e.g. 600 req/min) while restricting low-power solar sensors (e.g. 10 req/min).
- **Canonical Response Headers:** Emits `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` on HTTP 429 status codes.
- **Unit Tests:** Verified by 5 automated tests in `backend/tests/throttleService.test.js`.
- **Documentation:** [`backend/docs/week2-rate-limiting-and-throttling.md`](file:///c:/NexusFlow/backend/docs/week2-rate-limiting-and-throttling.md).

### 3.4 Gateway Security Hardening Audit (`backend/docs/week2-api-security-audit.md`)
- Threat modeling against Telemetry Injection, DoS Flooding, Payload Tampering, and Broken Object Level Auth (BOLA).
- Input sanitization standards: mandatory deviceId check, float bounding, 256KB body ceiling, and server-authoritative timestamps.

---

## 4. Comprehensive Test Verification Matrix

| Test Suite | File Location | Tests | Passed | Success Rate | Coverage Scope |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Rule Engine Tests** | `backend/tests/ruleEngine.test.js` | 8 | 8 | 100% | Condition evaluation (`>`, `<`, `>=`, `<=`, `==`, `!=`), sandbox runner |
| **Telemetry Validation** | `backend/tests/telemetryValidation.test.js` | 6 | 6 | 100% | Missing keys, precision rounding, fallback defaults, ISO timestamps |
| **End-to-End Integration** | `backend/tests/integration.test.js` | 3 | 3 | 100% | Ingestion $\rightarrow$ Rule trigger $\rightarrow$ Alert creation $\rightarrow$ Resolution |
| **Webhook Service** | `backend/tests/webhookService.test.js` | 5 | 5 | 100% | HMAC-SHA256 signature, payload formatting, registration, test dispatch |
| **Circular Ring Buffer** | `backend/tests/bufferService.test.js` | 5 | 5 | 100% | FIFO eviction, capacity bounds, slice sequence, multi-device isolation |
| **Throttle Rate Limiter** | `backend/tests/throttleService.test.js` | 5 | 5 | 100% | Window rolling, token decrement, 429 backoff, device isolation, overrides |
| **System Diagnostics** | `backend/scripts/health-check.js` | 8 | 8 | 100% | Node runtime environment, memory RSS, 7 database JSON file structures |
| **Total Automated Tests** | — | **32** | **32** | **100%** | **Full Backend Pipeline Verified** |

---

## 5. Peer-Reviewed GitHub Pull Requests (Backend Week 2)

- [**PR #19**](https://github.com/AP24110011006/NexusFlow/pull/19): `feat(backend): Week 2 - Webhook notification service, HMAC-SHA256 signature, unit tests & deliverables report` (Merged)
- [**PR #22**](https://github.com/AP24110011006/NexusFlow/pull/22): `feat(backend): Week 2 - Circular ring buffer service, buffer unit tests, architecture doc & batch ingestion API specs` (Merged)
- [**PR #25**](https://github.com/AP24110011006/NexusFlow/pull/25): `feat(backend): Week 2 - Sliding-window rate limiting service, throttle unit tests, security audit & DDoS architecture` (Merged)

---

## 6. Sign-off & Verification

All deliverables have been tested against Node.js v24.14.0 (win32-x64), integrated into `main`, and approved for Infotact Solutions Week 2 milestone evaluation.

*Prepared and Submitted by:*  
**Koneti Manikanth**  
Backend Engineering Lead / Web Development Intern  
Ref. No.: `ITS/WEB/1849`  
Email: `manikanth9878@gmail.com`  
Date: 20 November 2026
