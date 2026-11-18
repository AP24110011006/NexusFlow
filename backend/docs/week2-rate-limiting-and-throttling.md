# NexusFlow — Week 2: IoT Rate Limiting & Gateway Throttling Architecture
**Author:** Koneti Manikanth (Backend Engineering Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 2 Deliverable — Traffic Regulation & DDoS Defense

---

## 1. Executive Overview

In large-scale industrial IoT deployments, field sensors, smart meters, and edge gateways transmit telemetry packets at varying frequencies. Without robust server-side traffic throttling, anomalous edge conditions (such as network reconnect storms, firmware retry loops, or malicious DDoS attempts) can exhaust server worker threads, saturate database I/O, and destabilize event bus pipelines.

Week 2 introduces the **NexusFlow Sliding-Window Throttle Service** (`backend/services/throttleService.js`), engineered specifically for high-concurrency ingestion endpoints (`/api/telemetry`, `/api/telemetry/batch`).

---

## 2. Throttling Architecture & Algorithm Comparison

```
+---------------------------------------------------------------------------------+
|                               Ingress Gateway                                   |
|   +-----------------------+      +--------------------+      +--------------+   |
|   | Incoming HTTP Request | ---> | ThrottleService    | ---> | Controller / |   |
|   | Header: X-Device-ID   |      | Sliding Window Log |      | Rule Engine  |   |
|   +-----------------------+      +--------------------+      +--------------+   |
|                                            |                                    |
|                                 [Over Limit (> Quota)]                          |
|                                            v                                    |
|                              HTTP 429 Too Many Requests                         |
|                              Header: Retry-After: <sec>                         |
+---------------------------------------------------------------------------------+
```

### Algorithm Evaluation:

| Metric | Fixed Window Counter | Token Bucket | Sliding Window Counter (NexusFlow) |
| :--- | :--- | :--- | :--- |
| **Boundary Burst Vulnerability** | High (2x traffic at window edges) | Low | **Zero (Continuous sliding window)** |
| **Memory Footprint** | Extremely Low ($O(1)$) | Low ($O(1)$) | **Low ($O(k)$ per active client window)** |
| **Precision** | Coarse | Moderate | **High (Exact millisecond timestamps)** |
| **Per-Device Custom Quotas** | Static | Moderate | **Dynamic via Device Override Registry** |

---

## 3. Standard Response Headers

When traffic is evaluated, NexusFlow returns canonical IETF rate-limiting headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 114
X-RateLimit-Reset: 1731940980
Content-Type: application/json
```

When a device exceeds its quota, the gateway immediately short-circuits execution with HTTP 429:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1731941012
Retry-After: 32
Content-Type: application/json

{
  "error": "Too Many Requests",
  "message": "Rate limit of 120 requests per 60s exceeded for DEV-004.",
  "retryAfterMs": 31540
}
```

---

## 4. Per-Device Tiering & Overrides

NexusFlow supports dynamic capacity classes based on hardware specs:

```javascript
// High-frequency vibration sensor tier (600 packets/min)
throttleService.setDeviceOverride('DEV-VIB-01', 600, 60000);

// Low-power solar environmental sensor tier (10 packets/min)
throttleService.setDeviceOverride('DEV-ENV-09', 10, 60000);
```

---

## 5. Verification & Unit Testing

The sliding window implementation is validated by automated test suite [`backend/tests/throttleService.test.js`](file:///c:/NexusFlow/backend/tests/throttleService.test.js):
- ✅ Allows requests within quota and decrements tokens monotonically
- ✅ Blocks bursts exceeding limit and generates millisecond-accurate `retryAfterMs`
- ✅ Strict multi-tenant device key isolation
- ✅ Dynamic override enforcement
- ✅ Fast manual and automated bucket resets

*Approved by:* Koneti Manikanth  
*Date:* November 2026
