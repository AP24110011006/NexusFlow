# NexusFlow — Frontend Sitemap & Navigation Architecture
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Information Architecture & Route Topology  

---

## 1. Application Layout Shell Structure

NexusFlow's Single Page Application is wrapped in a unified shell consisting of:
- **`Sidebar.jsx` (Navigation Drawer):** Persistent vertical navigation bar displaying the NexusFlow brand, module routes, connection state pill, and live simulation controls.
- **`Navbar.jsx` (Top Utility Bar):** Breadcrumb pathing, search filter input, real-time Socket.IO connection status indicator, active alert counter badge, and user session profile dropdown.
- **`Layout.jsx` (Content Container):** Responsive viewport wrapper providing padded main container with dynamic outlet routing.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Navbar.jsx                                │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                         │
│ Sidebar.jsx  │                   <Outlet />                            │
│              │               Active Page View                          │
│  - Brand     │         (Dashboard / Devices / Rules / etc.)            │
│  - Nav Links │                                                         │
│  - Live Sim  │                                                         │
│              │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Route Hierarchy & Route Map

| Path | Component | Module Title | Access Role | Description |
|---|---|---|---|---|
| `/` | `Dashboard.jsx` | Module 1: Executive Dashboard | Viewer / Admin | Real-time sensor gauges, key telemetry aggregates, alert banners |
| `/devices` | `Devices.jsx` | Module 2: Device Management | Admin | Sensor registry, hardware provisioning modal, status filters |
| `/telemetry` | `Telemetry.jsx` | Module 3: Telemetry Stream | Viewer / Admin | Live time-series stream, raw JSON inspect, metric selector |
| `/rules` | `Rules.jsx` | Module 4: Rule Engine Config | Admin | Visual rule builder, condition test sandbox, active triggers |
| `/alerts` | `Alerts.jsx` | Module 5: Alert Management | Viewer / Admin | Triggered events, severity filtering, acknowledge / resolve actions |
| `/analytics` | `Analytics.jsx` | Module 6: Visual Analytics | Viewer / Admin | Multi-sensor comparative area charts, historical distributions |
| `/logs` | `Logs.jsx` | Module 7: Event Logs | Admin | Audit trail of rule firings, hardware heartbeats, admin modifications |
| `/settings` | `Settings.jsx` | Module 8: System Settings | Admin | Threshold defaults, simulator interval adjustments, user profile |

---

## 3. Real-Time State Synchronisation Flow

```
[ WebSocket Server (Socket.IO) ]
             │
             ├─── 'telemetry:new' ───> useSocket Hook ───> Dashboard & Telemetry State
             │
             ├─── 'alert:new'     ───> Global Alert Context ───> Navbar Counter & Toast Notification
             │
             └─── 'device:status' ───> Device Store ───> Device Management Registry
```

---

## 4. Navigation UX Features
1. **Persistent Visual Active State:** Current URL route highlighted with cyan gradient fill and indicator bar.
2. **Badge Counters:** Live count of unacknowledged alerts rendered on the Alerts sidebar link.
3. **Graceful Fallbacks:** 404 Not Found route redirecting users to `/` with navigational toast hint.
4. **Keyboard Accessibility:** `Tab` and `Shift+Tab` traversal through all primary links and buttons.
