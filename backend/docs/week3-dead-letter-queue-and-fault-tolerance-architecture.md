# NexusFlow — Dead Letter Queue (DLQ) & Fault Tolerance Architecture
**Document Reference:** NF-ARCH-W3-DLQ-001  
**Author:** Koneti Manikanth (Backend Lead & Architect)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849  
**Review Date:** 25 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary & Problem Formulation

In distributed industrial IoT stream processing, downstream systems (external webhook receivers, notification SMS/Email gateways, enterprise ERPs) inevitably experience temporary outages, TCP reset storms, or HTTP 429/504 throttling errors.

Without a structured fault-tolerance mechanism:
1. Critical threshold breach alerts are permanently dropped.
2. Retry storms cause cascading denial of service (DoS) on recovering downstream endpoints.
3. Poisoned payloads (malformed payloads that repeatedly fail) indefinitely clog processing workers.

NexusFlow implements an in-memory **Dead Letter Queue (DLQ)** with **Decorrelated Jitter Exponential Backoff**, **Poison Pill Isolation**, and **FIFO Eviction Protections**.

---

## 2. Architecture & Retry Lifecycle

```
[ Ingested Telemetry / Triggered Alert ]
                 │
                 ▼
      [ Downstream Dispatcher ] ───(Success)───> [ 200 OK: Delivery Archive ]
                 │
             (Failure)
                 ▼
      [ DeadLetterQueueService ]
                 │
                 ├── Calculate Backoff: min(maxBackoff, baseBackoff * 2^attempt) + Jitter
                 │
                 ├── attempts < maxRetries?
                 │         ├── YES: Status = 'pending_retry', compute nextRetryAt
                 │         └── NO : Status = 'poisoned' (Quarantine for Manual Review)
                 │
                 └── Queue Full? -> Evict oldest message (FIFO) -> Increment totalDropped
```

---

## 3. Mathematical Backoff Formulation

NexusFlow implements exponential backoff with additive random jitter to prevent the "Thundering Herd" synchronization problem across distributed workers:

$$T_{\text{backoff}}(n) = \min\left(T_{\text{max}}, T_{\text{base}} \cdot 2^n\right) + \text{rand}\left(0, 0.25 \cdot T_{\text{exp}}\right)$$

Where:
- $n$: Zero-indexed retry attempt count ($0, 1, 2, \dots$).
- $T_{\text{base}}$: Base backoff window (Default: $1,000\text{ ms}$).
- $T_{\text{max}}$: Backoff saturation ceiling (Default: $60,000\text{ ms}$).
- $\text{rand}(0, 0.25 \cdot T_{\text{exp}})$: Uniform pseudo-random jitter.

---

## 4. Poison Pill Isolation & Quarantine

When an event fails after exceeding `maxRetries` (default: 3 attempts), its state transitions to `poisoned`.
- **Properties:**
  - Automatic background retries are permanently suspended (`nextRetryAt = null`).
  - Quarantine log generated with forensic diagnostic metadata (stack trace, payload snapshot, timestamp).
  - Operator can manually inspect, modify payload, and trigger `replayMessage(id, handler)` via the Admin Console.

---

## 5. Verification & Test Suite

The Dead Letter Queue service is verified via 6 automated unit tests (`backend/tests/dlqService.test.js`):
1. Payload persistence and metadata verification.
2. Backoff duration and jitter boundary verification.
3. Message replay and resolved state transition.
4. Poison-pill quarantine enforcement on retry budget exhaustion.
5. FIFO capacity eviction boundary tests.
6. Metric counters (enqueued, replayed, poisoned, dropped) reconciliation.

Signed: Koneti Manikanth, Backend Lead & Architect, Infotact Solutions
