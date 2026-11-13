# NexusFlow — Frontend Wireframes & User Journey Flowcharts
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — UX Wireframes & Interactive Journey Architecture  

---

## 1. Primary User Journey Flowcharts

### 1.1 Live Monitoring & Anomaly Resolution Flow

```
[ Operator Logs In ]
         │
         ▼
[ Module 1: Dashboard ]
         │
         ├─── Real-Time Telemetry Stream (< 50ms)
         │           │
         │           ▼
         │    [ Threshold Exceeded ] (e.g. Temp > 40°C)
         │           │
         │           ▼
         ├─── Audio-Visual Toast & Navbar Badge Alert
         │           │
         │           ▼
         └─── Click Alert Link ───> [ Module 5: Alerts ]
                                            │
                                            ├── [ Acknowledge ]
                                            │        │
                                            │        ▼
                                            │   Logged in EventLogs
                                            │
                                            └── [ Mark Resolved ]
```

### 1.2 Rule Engine Configuration Flow

```
[ Operator navigates to /rules ]
         │
         ▼
[ Click "Create New Rule" ] ───> Opens Accessible Modal Dialog
                                             │
    ┌────────────────────────────────────────┴────────────────────────────────────────┐
    │                                                                                 │
    ▼                                                                                 ▼
[ Enter Rule Name ]                                                        [ Set Metric & Operator ]
(e.g. "Overheat Safety")                                                   (Temperature > 40°C)
    │                                                                                 │
    └────────────────────────────────────────┬────────────────────────────────────────┘
                                             │
                                             ▼
                               [ Test in In-Memory Sandbox ]
                                             │
                                             ▼
                                     [ Save & Activate ]
                                             │
                                             ▼
                           Dispatched to Backend Engine via API
```

---

## 2. Layout Wireframe Schematics

### 2.1 Executive Dashboard Wireframe (`/`)
```
+-----------------------------------------------------------------------------------------+
| [LOGO] NexusFlow   | Search sensors...           | Status: CONNECTED (o) | Alerts: [3]  |
+--------------------+--------------------------------------------------------------------+
| [=] Dashboard      | SYSTEM OVERVIEW                                                    |
| [=] Devices        | +------------------+ +------------------+ +----------------------+  |
| [=] Telemetry      | | Active Nodes: 5  | | Live Stream: ON  | | Active Alerts: 2 (▲) |  |
| [=] Rule Engine    | +------------------+ +------------------+ +----------------------+  |
| [=] Alerts         |                                                                    |
| [=] Analytics      | REAL-TIME SENSOR GAUGES & METRICS                                  |
| [=] Event Logs     | +------------------------------------+ +-------------------------+ |
| [=] Settings       | | Temperature Radial Gauge (0-100°C) | | Live Line Plot (60s)    | |
|                    | | Current: 38.4°C [SAFE]             | | Gradient Fill Area      | |
|                    | +------------------------------------+ +-------------------------+ |
|                    |                                                                    |
| [Live Simulator: >]| RECENT TELEMETRY EVENTS TABLE                                      |
| Rate: 3s           | [Timestamp]  [Device ID]   [Temp]   [Humidity]  [Pressure]   [Status]|
+--------------------+--------------------------------------------------------------------+
```
