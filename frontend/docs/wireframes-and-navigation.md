# NexusFlow — Frontend Wireframes & Navigation Architecture
**Author:** Likhitha (Frontend Role — Core UI & Layout)  
**Milestone:** Week 1 Deliverable — UI Scaffolding & Navigation Design  

---

## 1. Design Principles
- **Theme:** High-contrast industrial glassmorphism on slate-950 base.
- **Responsiveness:** Fluid grid layouts adapting from mobile to multi-monitor operations consoles.
- **State Feedback:** Pulsing green indicators for active WebSocket streams, red alarms on threshold breaches.

## 2. Navigation Hierarchy
```
MainLayout
├── Sticky Topbar: [Logo] [WS Status] [Audio Alert Toggle] [Alert Badge] [Persona Dropdown]
├── Sticky Simulator Ribbon: [Stream State] [Play/Pause] [Interval 1-5s] [Spike Injectors]
├── Left Sidebar (Fixed 64px/256px):
│   ├── / (Dashboard)
│   ├── /devices (Device Inventory & Provisioning)
│   ├── /telemetry (Streaming Telemetry & Manual Ingest)
│   ├── /rules (Visual Rule Engine Builder & Sandbox)
│   ├── /alerts (Incident Management & Audit)
│   ├── /analytics (Historical Time-Series & Cross-Node Comparison)
│   ├── /logs (Event Audit Trail)
│   └── /settings (Preferences & Diagnostics)
└── Dynamic Viewport (Main Content Area)
```
