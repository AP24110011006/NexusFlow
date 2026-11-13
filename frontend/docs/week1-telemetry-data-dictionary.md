# NexusFlow — IoT Telemetry Data Dictionary & Field Specifications
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Telemetry Data Dictionary & Semantic Modeling  

---

## 1. Primary Physical Channels & Metric Metadata

NexusFlow normalizes heterogenous sensor measurements across industrial zones into standard engineering units:

| Channel Metric | Engineering Unit | Symbol | Minimum Bound | Maximum Bound | Nominal Operational Range | Sensor Resolution | Default Rule Threshold |
|---|---|---|---|---|---|---|---|
| **Ambient Temperature** | Celsius | °C | -40.0 | +125.0 | 18.0 – 26.0 °C | 0.01 °C | `> 40.0 °C` (Critical Overheat) |
| **Relative Humidity** | Percentage | % | 0.0 | 100.0 | 40.0 – 60.0 % | 0.1 % | `< 30.0 %` (Low Humidity Aridity) |
| **Atmospheric Pressure** | Hectopascal | hPa | 800.0 | 1200.0 | 1005.0 – 1025.0 hPa | 0.1 hPa | `> 1040.0 hPa` (Overpressure Hazard) |
| **Battery Level** | Percentage | % | 0 | 100 | 20 – 100 % | 1 % | `< 20 %` (Low Battery Warning) |
| **Signal Strength** | Decibel-milliwatts | dBm | -120 | 0 | -75 to -45 dBm | 1 dBm | `< -95 dBm` (Weak Link Degradation) |

---

## 2. Ingestion JSON Payload Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NexusFlowTelemetryPacket",
  "type": "object",
  "required": ["deviceId", "timestamp"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "deviceId": { "type": "string", "pattern": "^DEV-[0-9]{4}$" },
    "temperature": { "type": "number", "minimum": -40.0, "maximum": 125.0 },
    "humidity": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "pressure": { "type": "number", "minimum": 800.0, "maximum": 1200.0 },
    "battery": { "type": "integer", "minimum": 0, "maximum": 100 },
    "rssi": { "type": "integer", "minimum": -120, "maximum": 0 },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
```

---

## 3. Data Integrity & Anomaly Codes

| Code | Label | Cause | UI Representation |
|---|---|---|---|
| `ERR_SENSOR_TIMEOUT` | No Heartbeat | Sensor silent for $> 3\times$ sampling interval | Gray node pill, amber warning badge |
| `ERR_OUT_OF_BOUNDS` | Clip Exceeded | Value outside physical bounds (e.g., Temp > 150°C) | Strikethrough reading with warning icon |
| `ERR_CORRUPT_CRC` | Frame Error | Checksum mismatch during LoRa/MQTT bridge | Discarded packet, increment packet drop count |
| `WARN_DRIFT_DETECTED` | Thermal Drift | Moving standard deviation $> 3.5$ for 10 minutes | Cyan diagnostic pill in Analytics tab |
