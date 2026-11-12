# NexusFlow — Week 1 REST API Contract Specification
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 Planning & API Interface Standardization  

---

## 1. Overview
This document specifies the exact JSON contracts, validation rules, HTTP status codes, and error representations agreed upon for the Week 1 milestone between Backend (Manikanth) and Frontend (Likhitha & Harshitha).

---

## 2. Telemetry Ingestion Contract

### `POST /api/telemetry`
Receives and processes streaming sensor measurements.

#### Headers
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (Optional in developer demo mode)

#### Request Payload Schema
```json
{
  "deviceId": "SENSOR_001",
  "temperature": 45.2,
  "humidity": 38.5,
  "pressure": 1013.2,
  "battery": 92,
  "rssi": -65,
  "timestamp": "2026-11-12T10:30:00.000Z"
}
```

#### Field Specifications & Validation Constraints
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `deviceId` | String | Yes | Alphanumeric, 3–32 chars | Hardware identifier of target sensor node |
| `temperature` | Float | No | -50.0 to 150.0 | Ambient temperature in Celsius (°C) |
| `humidity` | Float | No | 0.0 to 100.0 | Relative humidity percentage (%) |
| `pressure` | Float | No | 800.0 to 1200.0 | Atmospheric pressure in hectopascals (hPa) |
| `battery` | Integer | No | 0 to 100 | Remaining node battery percentage |
| `rssi` | Integer | No | -120 to 0 | Received Signal Strength Indicator (dBm) |
| `timestamp` | ISO String | No | Valid ISO 8601 | Defaults to `Date.now()` if omitted |

#### Response Codes
- `201 Created`: Telemetry successfully ingested, stored, evaluated, and broadcast.
  ```json
  {
    "success": true,
    "data": { ... },
    "rulesEvaluated": 2,
    "triggeredAlerts": ["alt_0a1b2c3d"]
  }
  ```
- `400 Bad Request`: Payload missing mandatory `deviceId` or malformed numeric fields.

---

## 3. Rule Evaluation Sandbox Contract

### `POST /api/rules/test`
Allows frontend engineers to test hypothetical rule evaluations in memory without side effects.

#### Request Schema
```json
{
  "rule": {
    "metric": "temperature",
    "operator": ">",
    "threshold": 40
  },
  "sampleTelemetry": {
    "temperature": 46.5
  }
}
```

#### Response Schema
```json
{
  "matched": true,
  "reason": "Condition SATISFIED: 46.5 > 40 evaluates to TRUE.",
  "value": 46.5,
  "operator": ">",
  "threshold": 40,
  "timestamp": "2026-11-12T10:35:00.000Z"
}
```

---

## 4. Error Response Envelope
All error responses conform to a unified format:
```json
{
  "error": "Error title or code",
  "message": "Human readable technical explanation",
  "statusCode": 400
}
```
