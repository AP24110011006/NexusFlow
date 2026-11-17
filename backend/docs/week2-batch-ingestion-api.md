# NexusFlow — Batch Telemetry Ingestion API Specification
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 2 — Bulk Ingestion & Gateway Protocols  

---

## 1. Overview & Protocol Motivation

Industrial gateways (e.g. Raspberry Pi, Advantech, Siemens SIMATIC edge nodes) aggregate sensor telemetry locally over Modbus / Zigbee / LoRa and upload data in batches rather than transmitting individual HTTP requests for every sample.

The **Batch Ingestion API** accepts up to 500 telemetry packets in a single HTTP `POST` transaction.

---

## 2. Endpoint Specification

### `POST /api/telemetry/batch`

#### Headers
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (Optional in demo mode)

#### Request Payload Schema
```json
{
  "gatewayId": "GW-SOUTH-01",
  "batchTimestamp": "2026-11-17T09:00:00.000Z",
  "readings": [
    {
      "deviceId": "DEV-1001",
      "temperature": 28.4,
      "humidity": 45.2,
      "pressure": 1013.2,
      "timestamp": "2026-11-17T08:59:50.000Z"
    },
    {
      "deviceId": "DEV-1002",
      "temperature": 34.1,
      "humidity": 55.0,
      "pressure": 1010.5,
      "timestamp": "2026-11-17T08:59:55.000Z"
    }
  ]
}
```

#### Response Payload (201 Created)
```json
{
  "success": true,
  "processedCount": 2,
  "errorsCount": 0,
  "alertsTriggered": [],
  "processingTimeMs": 1.45
}
```

---

## 3. Error Codes & Partial Rejections
- `400 Bad Request`: Payload missing `readings` array or exceeds 500 items limit.
- `422 Unprocessable Entity`: Individual malformed packets within batch are logged and returned in `errors` list while valid packets are persisted successfully.
