# NexusFlow — Database Schema & Data Dictionary
**Author:** Koneti Manikanth (Backend Role — Ref: ITS/WEB/1849)  
**Milestone:** Week 1 Deliverable — Schema Architecture & Persistence Modeling  

---

## 1. Storage Architecture Overview
NexusFlow implements a multi-collection persistence engine designed for high-frequency IoT telemetry logging. The persistence engine supports zero-dependency local JSON state persistence with seamless fallback and plug-and-play MongoDB schema compatibility.

```mermaid
erDiagram
    DEVICES ||--o{ TELEMETRY : "emits"
    DEVICES ||--o{ ALERTS : "experiences"
    RULES ||--o{ ALERTS : "triggers"
    USERS ||--o{ ALERTS : "acknowledges/resolves"
    EVENT_LOGS }o--|| DEVICES : "audits"
    
    DEVICES {
        string id PK
        string deviceId UK
        string name
        string type
        string location
        string status
        string ipAddress
        string macAddress
        number battery
        number reportingInterval
        timestamp lastSeen
    }

    TELEMETRY {
        string id PK
        string deviceId FK
        float temperature
        float humidity
        float pressure
        number battery
        number rssi
        timestamp timestamp
    }

    RULES {
        string id PK
        string name
        string deviceId FK
        string metric
        string operator
        float threshold
        string severity
        number cooldownSeconds
        boolean enabled
        number triggerCount
    }

    ALERTS {
        string id PK
        string ruleId FK
        string deviceId FK
        float value
        float threshold
        string severity
        string status
        string message
        timestamp createdAt
        timestamp acknowledgedAt
        timestamp resolvedAt
    }
```

---

## 2. Retention Policies & Performance Tuning
- **Circular Telemetry Buffer:** Maximum 2,000 recent measurements maintained in active memory/file buffer for ultra-fast query latency ($< 3\text{ ms}$).
- **Audit Logs Ring Buffer:** Maximum 1,000 event log entries retained.
- **Debounce Indexing:** Key-value mapping `(ruleId + deviceId) -> lastTriggeredTimestamp` ensuring zero duplicate alert spam during consecutive anomalous readings.
