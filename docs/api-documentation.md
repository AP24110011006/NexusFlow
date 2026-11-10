# NexusFlow — Complete REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authorization:** `Bearer <token>` (Optional in demo mode)  
**Content-Type:** `application/json`

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Method:** `POST`
- **Route:** `/auth/login`
- **Request Body:**
```json
{
  "email": "manikanth9878@gmail.com",
  "password": "nexus2026"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr_manikanth",
    "name": "Koneti Manikanth",
    "email": "manikanth9878@gmail.com",
    "role": "Associate L1. Intern",
    "department": "Web Development",
    "organization": "Infotact Solutions",
    "refNo": "ITS/WEB/1849"
  }
}
```

---

## 2. Device Management Endpoints

### 2.1 Get All Devices
- **Method:** `GET`
- **Route:** `/devices`
- **Query Parameters:** `status` (`online`, `warning`, `offline`), `type`, `search`
- **Response (200 OK):**
```json
{
  "devices": [
    {
      "id": "dev_001",
      "deviceId": "SENSOR_001",
      "name": "Assembly Line Climate Probe",
      "type": "Environmental Sensor",
      "location": "Factory Floor - Room 101",
      "status": "online",
      "battery": 92,
      "lastReading": {
        "temperature": 28.5,
        "humidity": 48.2,
        "pressure": 1012.8,
        "timestamp": "2026-11-10T10:00:00.000Z"
      }
    }
  ],
  "counts": { "total": 5, "online": 4, "warning": 1, "offline": 0 }
}
```

### 2.2 Register New Device
- **Method:** `POST`
- **Route:** `/devices`
- **Request Body:**
```json
{
  "deviceId": "SENSOR_006",
  "name": "Chemical Storage Monitoring Probe",
  "type": "Environmental Sensor",
  "location": "Warehouse Unit 4",
  "reportingInterval": 3
}
```
- **Response (201 Created):** Returns the registered device object with auto-assigned MAC and IP.

### 2.3 Toggle / Change Device Status
- **Method:** `POST`
- **Route:** `/devices/:id/status`
- **Request Body:** `{"status": "offline"}`
- **Response (200 OK):** Updated device object.

### 2.4 Delete Device
- **Method:** `DELETE`
- **Route:** `/devices/:id`
- **Response (200 OK):** `{"success": true, "message": "Device SENSOR_006 deleted successfully"}`

---

## 3. Telemetry Ingestion Endpoints

### 3.1 Ingest Sensor Telemetry (Core API)
- **Method:** `POST`
- **Route:** `/telemetry`
- **Request Body:**
```json
{
  "deviceId": "SENSOR_001",
  "temperature": 45.2,
  "humidity": 42.0,
  "pressure": 1013.5,
  "battery": 91,
  "timestamp": "2026-11-10T10:30:00.000Z"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "14f2e960-a824-469b-8ca0-3796dcfc6230",
    "deviceId": "SENSOR_001",
    "temperature": 45.2,
    "humidity": 42.0,
    "pressure": 1013.5,
    "battery": 91,
    "timestamp": "2026-11-10T10:30:00.000Z"
  },
  "rulesEvaluated": 1,
  "triggeredAlerts": ["alt_1c9b2e04"]
}
```

### 3.2 Query Telemetry History
- **Method:** `GET`
- **Route:** `/telemetry`
- **Query Parameters:** `deviceId`, `startDate`, `endDate`, `limit` (default: 100)

### 3.3 Get Telemetry KPI Stats
- **Method:** `GET`
- **Route:** `/telemetry/stats`
- **Response (200 OK):**
```json
{
  "totalDataPoints": 620,
  "activeDevices": 4,
  "totalDevices": 5,
  "averageTemperature": 28.4,
  "averageHumidity": 46.1,
  "averagePressure": 1013.9
}
```

---

## 4. Rule Engine Endpoints

### 4.1 Get All Rules
- **Method:** `GET`
- **Route:** `/rules`
- **Query Parameters:** `enabled`, `metric`, `deviceId`

### 4.2 Create New Rule
- **Method:** `POST`
- **Route:** `/rules`
- **Request Body:**
```json
{
  "name": "Assembly Line High Temperature",
  "description": "Flags temperature exceeding safe factory limits",
  "deviceId": "SENSOR_001",
  "metric": "temperature",
  "operator": ">",
  "threshold": 40,
  "severity": "critical",
  "cooldownSeconds": 30,
  "messageTemplate": "High temp alert: {{value}}°C on {{device}}"
}
```

### 4.3 Interactive Rule Sandbox Evaluation
- **Method:** `POST`
- **Route:** `/rules/test`
- **Request Body:**
```json
{
  "rule": {
    "metric": "temperature",
    "operator": ">",
    "threshold": 40
  },
  "sampleTelemetry": {
    "temperature": 45.5
  }
}
```
- **Response (200 OK):**
```json
{
  "matched": true,
  "reason": "Condition SATISFIED: 45.5 > 40 evaluates to TRUE.",
  "value": 45.5,
  "operator": ">",
  "threshold": 40,
  "timestamp": "2026-11-10T10:35:00.000Z"
}
```

---

## 5. Alert Management Endpoints

### 5.1 Get Alerts
- **Method:** `GET`
- **Route:** `/alerts`
- **Query Parameters:** `status` (`active`, `acknowledged`, `resolved`), `severity`, `deviceId`

### 5.2 Acknowledge Alert
- **Method:** `POST`
- **Route:** `/alerts/:id/acknowledge`
- **Request Body:** `{"user": "Koneti Manikanth"}`

### 5.3 Resolve Alert
- **Method:** `POST`
- **Route:** `/alerts/:id/resolve`
- **Request Body:** `{"user": "Koneti Manikanth", "resolutionNote": "Ventilation activated, temperature lowered to 32°C"}`

---

## 6. Visual Analytics Endpoints

### 6.1 Historical Trends
- **Method:** `GET`
- **Route:** `/analytics/trends`
- **Query Parameters:** `range` (`1h`, `6h`, `24h`, `7d`), `deviceId`, `metric`

### 6.2 Device Comparison
- **Method:** `GET`
- **Route:** `/analytics/comparison`
- **Response:** Returns aggregated average, min, max values for each connected device.

---

## 7. IoT Simulator Controls

### 7.1 Ingestion Status
- **Method:** `GET`
- **Route:** `/simulator/status`

### 7.2 Start / Stop Simulator
- **Method:** `POST`
- **Route:** `/simulator/start` (Body: `{"intervalMs": 3000}`)
- **Route:** `/simulator/stop`

### 7.3 Manual Anomaly Injection (Instant Rule Engine Test)
- **Method:** `POST`
- **Route:** `/simulator/inject`
- **Request Body:**
```json
{
  "deviceId": "SENSOR_001",
  "metric": "temperature",
  "value": 48.5
}
```
