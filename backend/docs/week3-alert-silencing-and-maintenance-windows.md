# NexusFlow — Alert Silencing & Maintenance Windows Architecture
**Document Reference:** NF-ARCH-W3-SIL-001  
**Author:** Koneti Manikanth (Backend Lead & Architect)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849  
**Review Date:** 27 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Operational Background & Problem Formulation

In industrial automation environments, routine maintenance, scheduled recalibration of telemetry transducers, and planned machinery overhauls inevitably produce artificial telemetry spikes. Without an intelligent alert silencing mechanism:
1. Operations Control Centers (OCC) suffer severe **Alert Fatigue**, increasing the risk that genuine, critical equipment failures are overlooked.
2. Unwanted multi-channel dispatches (SMS, PagerDuty, Webhooks) overwhelm downstream incident management tools.
3. On-call engineering hours are wasted acknowledging predictable maintenance alarms.

NexusFlow resolves this through a declarative, time-windowed **Alert Silence Service** (`backend/services/silenceService.js`).

---

## 2. Matcher Evaluation Model

Alert silences operate on pattern matchers evaluated against the canonical incident payload:

```
[ Ingested Telemetry ] ──> [ Threshold Rule Breach ] ──> [ Alert Silence Engine ]
                                                                   │
                                                ┌──────────────────┴──────────────────┐
                                                ▼                                     ▼
                                       [ Within Active Window? ]             [ Outside Window? ]
                                                │                                     │
                                       ┌────────┴────────┐                            ▼
                                       ▼                 ▼                    [ Dispatch Alert ]
                                 [ Matchers Hit ]   [ No Match ]
                                       │                 │
                                       ▼                 ▼
                              [ SUPPRESS ALERT ]  [ Dispatch Alert ]
                              (Inc. Metrics)
```

### Matcher Types Supported:
- **Exact Match:** `{ deviceId: 'SEN-TEMP-01', metric: 'temperature' }`
- **Wildcard Match:** `{ deviceId: 'SEN-VIB-04', severity: '*' }`
- **Regex Pattern:** `{ deviceId: '/^BLOWER-[0-9]+$/', metric: 'vibration' }`

---

## 3. Lifecycle States & Governance

1. **`active`:** Currently suppressing matching alerts between `startTimestamp` and `endTimestamp`.
2. **`expired`:** Epoch timestamp has exceeded `endTimestamp`. Silencing immediately ceases without manual intervention.
3. **`cancelled`:** An operator manually revoked the maintenance window early via `cancelSilence(id)`.
4. **Auditability:** Every silence record captures `createdBy`, `reason`, `createdAt`, and real-time `suppressedCount` for SOC 2 Type II compliance.

---

## 4. Test Suite Coverage

Validated via 6 automated unit tests (`backend/tests/silenceService.test.js`):
1. Creation with ISO 8601 timestamps and unique ID.
2. Targeted suppression across device/metric/severity tuples.
3. Boundary expiration enforcement.
4. Wildcard and regular expression pattern evaluation.
5. Immediate manual revocation (`cancelSilence`).
6. Comprehensive metric aggregations.

Signed: Koneti Manikanth, Backend Lead & Architect, Infotact Solutions
