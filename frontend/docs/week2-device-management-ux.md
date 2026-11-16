# NexusFlow — Device Management UX Architecture & Multi-View Topology
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 2 — Device Detail Views & Tabbed Navigation  

---

## 1. Overview & Interface Hierarchy

In Week 2, the Device Management module (`frontend/src/pages/Devices.jsx`) expands from a flat grid into a comprehensive inspection cockpit with slide-over drawers utilizing the new `Tabs.jsx` and `SearchBar.jsx` components.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Devices Registry                                                       │
│ ┌───────────────────────────┐ ┌──────────────┐ ┌────────────────────┐ │
│ │ SearchBar.jsx             │ │ Filter: Type │ │ + Provision Device │ │
│ └───────────────────────────┘ └──────────────┘ └────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ Card DEV-1001 ]  [ Card DEV-1002 ]  [ Card DEV-1003 ]               │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Click "Inspect Node"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Device Inspection Drawer (DEV-1001)                                    │
│ [Overview]  [Live Telemetry]  [Active Rules]  [Incident History]       │
├────────────────────────────────────────────────────────────────────────┤
│ • Node Health Scorecard (Composite % by Harshitha)                     │
│ • Hardware Metadata: IP, MAC, Firmware, Last Seen                      │
│ • Live Streaming Sparkline (Temp / Pressure / RSSI)                    │
│ • Direct "Trigger Calibration Tick" or "Simulate Fault"                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Interaction Rules

### 2.1 Tab Navigation (`Tabs.jsx`)
- **Keyboard ARIA Standards:** Implements `role="tablist"` with left/right arrow navigation, wrapping cyclically around the active array.
- **Micro-Interactions:** Subtle cyan indicator glow line transitions horizontally when active selection shifts.

### 2.2 Instant Search & Filter Bar (`SearchBar.jsx`)
- Supports debounced text filtering on device names, locations, and hardware IDs.
- Keyboard quick-dismiss with `Escape`.
- Displays dynamic match count badge.
