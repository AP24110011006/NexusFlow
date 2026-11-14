# NexusFlow — Database Entity-Relationship Diagram (ERD) & Schema Architecture
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 1 — Data Storage Model & Entity Relationships  

---

## 1. Entity-Relationship Overview

NexusFlow's persistence layer models the operational state of industrial IoT deployments across 7 core collections:

```
┌─────────────────┐       1:N       ┌────────────────────────┐
│     devices     ├────────────────►│       telemetry        │
│                 │                 │                        │
│ - id (PK)       │                 │ - id (PK)              │
│ - deviceId (UK) │                 │ - deviceId (FK)        │
│ - name          │                 │ - temperature          │
│ - type          │                 │ - humidity             │
│ - location      │                 │ - pressure             │
│ - status        │                 │ - battery, rssi        │
│ - lastSeen      │                 │ - timestamp            │
└────────┬────────┘                 └────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       1:N       ┌────────────────────────┐
│      rules      ├────────────────►│         alerts         │
│                 │                 │                        │
│ - id (PK)       │                 │ - id (PK)              │
│ - name          │                 │ - ruleId (FK)          │
│ - deviceId (FK) │                 │ - deviceId (FK)        │
│ - metric        │                 │ - metric, value        │
│ - operator      │                 │ - severity             │
│ - threshold     │                 │ - status (active/res)  │
│ - severity      │                 │ - createdAt            │
└─────────────────┘                 └────────────────────────┘
                                                 ▲
                                                 │ 1:N
┌─────────────────┐                 ┌────────────┴───────────┐
│      users      │                 │       eventLogs        │
│                 │                 │                        │
│ - id (PK)       │                 │ - id (PK)              │
│ - username (UK) │                 │ - type (alert/device)  │
│ - role          │                 │ - details              │
│ - email         │                 │ - timestamp            │
└─────────────────┘                 └────────────────────────┘
```

---

## 2. Collection Schemas & Indices

### 2.1 `devices` Collection
- **Primary Key:** `id` (UUID v4)
- **Unique Natural Key:** `deviceId` (e.g. `DEV-1001`)
- **Index:** `deviceId ASC` (Unique)
- **Fields:** `name`, `type`, `location`, `status`, `ipAddress`, `macAddress`, `firmwareVersion`, `lastReading`, `lastSeen`, `createdAt`.

### 2.2 `telemetry` Collection (Time-Series)
- **Primary Key:** `id` (UUID v4)
- **Foreign Key:** `deviceId` references `devices.deviceId`
- **Compound Index:** `{ deviceId: 1, timestamp: -1 }`
- **Fields:** `temperature`, `humidity`, `pressure`, `battery`, `rssi`, `timestamp`.

### 2.3 `rules` Collection
- **Primary Key:** `id` (UUID v4)
- **Foreign Key:** `deviceId` (Nullable — `'*'` applies globally to all devices)
- **Index:** `enabled: 1`
- **Fields:** `name`, `metric`, `operator`, `threshold`, `severity`, `action`, `cooldownSec`, `lastTriggered`, `enabled`.

### 2.4 `alerts` Collection
- **Primary Key:** `id` (UUID v4)
- **Foreign Keys:** `ruleId`, `deviceId`
- **Index:** `{ status: 1, severity: 1, createdAt: -1 }`
- **Fields:** `title`, `message`, `severity`, `status` (`'active'`, `'acknowledged'`, `'resolved'`), `value`, `threshold`, `acknowledgedAt`, `resolvedAt`.

---

## 3. Storage Evolution Roadmap

| Feature | Week 1 Implementation | Production Scaled Architecture |
|---|---|---|
| **Storage Engine** | Synchronous file-backed JSON store | PostgreSQL + TimescaleDB extension |
| **Partitioning** | In-memory slice filtering | Monthly hypertable time partitions |
| **Write Model** | Appending atomic disk flushes | WAL buffer with batch inserts |
| **Integrity** | Application-level validation | Foreign Key constraints & Cascades |
