# NexusFlow — MQTT Telemetry Ingestion Architecture & Design
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship Role:** Backend Lead / Associate L1. Intern  
**Author:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 1 — Ingestion Architecture & Protocol Expansion Planning  

---

## 1. Overview & Protocol Motivation

While HTTP `POST /api/telemetry` provides an accessible, ubiquitous ingestion channel for web applications and gateways, edge IoT devices (e.g. ESP32, STM32, LoRaWAN gateways) benefit extensively from the lightweight **MQTT 3.1.1 / 5.0** protocol due to:
- **Minimal Packet Overhead:** Fixed 2-byte header vs verbose HTTP text headers.
- **Persistent Bi-directional TCP Sessions:** Low latency keep-alive without TCP 3-way handshake on every reading.
- **Publish/Subscribe Architecture:** Decoupled telemetry producers from analytical consumers.

---

## 2. Topic Hierarchy Specification

NexusFlow standardizes on an organized, multi-tenant industrial topic structure:

```
nexusflow/
  └── v1/
      └── telemetry/
          └── {tenantId}/
              └── {deviceType}/
                  └── {deviceId}/
                      ├── data       (Periodic sensor payload)
                      ├── status     (LWT - Last Will and Testament)
                      └── cmd        (Downlink control commands)
```

### Examples:
- Device Telemetry: `nexusflow/v1/telemetry/infotact/environment/DEV-1001/data`
- Device Heartbeat / LWT: `nexusflow/v1/telemetry/infotact/environment/DEV-1001/status`
- Actuator Command: `nexusflow/v1/telemetry/infotact/environment/DEV-1001/cmd`

---

## 3. Quality of Service (QoS) & Delivery Semantics

| Message Class | Topic Pattern | QoS Level | Retain Flag | Rationale |
|---|---|---|---|---|
| Regular Telemetry | `.../data` | **QoS 0** (At most once) | `false` | High-frequency continuous stream; individual drops tolerable. |
| Critical Anomaly | `.../alerts` | **QoS 1** (At least once) | `false` | Guarantees alert acknowledgement by broker. |
| Device State (LWT) | `.../status` | **QoS 1** (At least once) | `true` | Retains last known state (`online` / `offline`) for newly connected clients. |

---

## 4. Architectural Ingestion Bridge

```
┌─────────────────┐
│  Edge Sensors   │
│  (MQTT Clients) │
└────────┬────────┘
         │ MQTTS (Port 8883)
         ▼
┌─────────────────┐
│ Mosquitto Broker│
│  or EMQX Broker │
└────────┬────────┘
         │ Internal MQTT Subscription (QoS 1)
         ▼
┌────────────────────────────────────────────────────────┐
│             NexusFlow MQTT Bridge Service              │
│                                                        │
│  1. Ingest Packet & Parse JSON                         │
│  2. Validate Schema against Device Registry            │
│  3. Persist to Time-Series Store                       │
│  4. Evaluate Rule Engine Predicates (O(R))             │
│  5. Forward to Socket.IO for Real-Time UI Broadcast    │
└────────────────────────────────────────────────────────┘
```

---

## 5. Payload Format Contract

```json
{
  "dev": "DEV-1001",
  "ts": 1731508200,
  "m": {
    "temp": 38.4,
    "hum": 42.1,
    "press": 1012.8,
    "batt": 94,
    "rssi": -68
  }
}
```

The ingestion bridge normalizes this compact edge payload into the canonical NexusFlow telemetry schema before dispatching to the rule engine and WebSocket server.
