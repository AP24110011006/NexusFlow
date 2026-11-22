# NexusFlow — Week 3: Slide-Over Drawers & Form Selection UX Patterns
**Author:** Likhitha (Frontend Core & UI Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Side-Sheet Ergonomics & Form Interaction Patterns

---

## 1. Executive Summary

As NexusFlow introduces multi-tiered alert escalation chains and intricate rule configuration forms, modal dialogs (`Modal.jsx`) become constrained by viewport centering, obstructing background live dashboards. 

Week 3 introduces the **NexusFlow Slide-Over Drawer** (`frontend/src/components/common/Drawer.jsx`) and **Custom Radio Group** (`frontend/src/components/common/RadioGroup.jsx`), providing high-ergonomics side-sheets that preserve context while operators inspect escalation timelines.

---

## 2. Drawer Layout & Interaction Architecture

```
+----------------------------------------------------+--------------------------+
|  NexusFlow Live Telemetry Dashboard                 | Drawer Header:           |
|                                                    | Active Escalation Chain  |
|  [ Industrial Zone B ]        [ Active Alerts (2) ]| [X]                      |
|                                                    +--------------------------+
|  +---------------------+   +---------------------+ | Current SLA Level:       |
|  | DEV-001 (Turbine)   |   | DEV-004 (HVAC)      | | Level 2 (Supervisor)     |
|  | Temp: 87.2 °C [!]   |   | Status: Warning     | |                          |
|  +---------------------+   +---------------------+ | Timeline:                |
|                                                    | * L1: On-Call (0 min)    |
|                                                    | * L2: Supervisor (10 min)|
|                                                    +--------------------------+
|                                                    | [Acknowledge]  [Resolve] |
+----------------------------------------------------+--------------------------+
```

### Component Props Matrix:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | `false` | Controls drawer visibility |
| `onClose` | `Function` | `undefined` | Dismissal handler (backdrop, ESC key, or X button) |
| `position` | `'right' \| 'left' \| 'bottom'` | `'right'` | Anchoring edge for slide-in transition |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Width presets (`max-w-sm` through `max-w-xl`) |
| `footer` | `ReactNode` | `null` | Pinned bottom action container |

---

## 3. Accessible Radio Group Ergonomics

`RadioGroup.jsx` replaces standard browser radio inputs with rich, card-like selection tiles:
- **Card-Style Hit Targets:** Large clickable areas (`p-3.5`) suitable for touchscreen industrial tablets.
- **Custom Indicators:** Animated concentric radio rings with high-contrast active borders (`border-blue-600`).
- **Semantic ARIA:** Encapsulated in `<div role="radiogroup">` with native hidden `<input type="radio">` preserving browser keyboard arrow navigation.

---

## 4. Design System Integration

Unified and exported via [`frontend/src/components/common/index.js`](file:///c:/NexusFlow/frontend/src/components/common/index.js).

*Prepared by:* Likhitha (Frontend Core Lead)  
*Date:* November 2026
