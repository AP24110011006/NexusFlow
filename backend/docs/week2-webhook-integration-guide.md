# NexusFlow — Webhook Notification Dispatch Architecture & Integration Guide
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 2 — External Alert Integration & Escalation  

---

## 1. Webhook Notification Architecture

In industrial environments, when critical conditions arise (such as temperature $> 40^\circ\text{C}$ or boiler pressure $> 1040\text{ hPa}$), NexusFlow immediately notifies external operational systems (Slack channels, PagerDuty incidents, SMS gateways, SCADA automation) via secure HTTP webhooks.

```
[ Rule Engine Trigger ]
          │
          ▼
   [ Alert Created ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│             NexusFlow Webhook Service                  │
│                                                        │
│  1. Filter active webhooks matching severity level     │
│  2. Build canonical JSON payload                       │
│  3. Compute HMAC-SHA256 signature header               │
│  4. HTTP POST to external URL                          │
│  5. Log dispatch status to audit eventLogs             │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
   [ Slack / Teams Ops ]        [ PagerDuty On-Call ]
```

---

## 2. Webhook Payload Specification

### Headers
- `Content-Type: application/json`
- `X-NexusFlow-Signature: <64-char-hex-hmac-sha256>`
- `X-NexusFlow-Event: alert:critical`

### Body Example
```json
{
  "event": "alert:critical",
  "timestamp": "2026-11-16T12:00:00.000Z",
  "data": {
    "alertId": "alt_0a1b2c3d",
    "ruleName": "Boiler Station 1 Overheat",
    "deviceId": "DEV-1004",
    "metric": "temperature",
    "value": 47.8,
    "threshold": 40.0,
    "severity": "critical",
    "message": "Critical threshold violation: temperature is 47.8°C"
  }
}
```

---

## 3. Cryptographic Signature Verification (Receiver Code)

### Node.js Receiver Example
```javascript
const crypto = require('crypto');

function verifyWebhook(payloadRawBody, receivedSignature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadRawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 4. Retry Policy & Delivery Guarantees
- **Timeout:** 5,000ms per attempt.
- **Backoff:** If external endpoint returns non-2xx status, the dispatcher retries at $t = [2\text{s}, 8\text{s}, 30\text{s}]$ before dead-letter logging.
