# NexusFlow — Frontend Responsive Design & Viewport Matrix
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Adaptive UI Architecture & Cross-Device Layouts  

---

## 1. Breakpoint Grid & Device Standards

NexusFlow conforms to standard Tailwind CSS responsive breakpoints tailored for industrial multi-screen operations:

| Breakpoint | Minimum Width | Target Hardware Form Factor | Layout Behavior | Navigation Mode |
|---|---|---|---|---|
| **Mobile (`sm`)** | 640px | Rugged Handheld Scanners & Phones | Single column stack, hidden metrics | Off-canvas sliding drawer |
| **Tablet (`md`)** | 768px | Industrial Tablets & Operator Panels | 2-column grid, compact charts | Collapsed 64px icon bar |
| **Laptop (`lg`)** | 1024px | Control Room Laptops | 3-column telemetry cards | Full 240px persistent sidebar |
| **Desktop (`xl`)** | 1280px | Operator Multi-Screen Workstations | 4-column telemetry grid | Expanded sidebar with node badges |
| **Ultra-Wide (`2xl`)**| 1536px+ | Central Wall Displays & SCADA Terminals | 4-6 column dashboard with dual charts | Static split-screen operations |

---

## 2. Component Adaptation Strategies

### 2.1 Telemetry Chart Auto-Resizing (`TelemetryChart.jsx`)
- Wrapped in `<ResponsiveContainer width="100%" height={260}>`.
- On mobile (`< 640px`), Y-axis labels hide decimal places (`toFixed(0)`) and the legend drops below the chart plane to preserve horizontal width.

### 2.2 Reusable Dialogs (`Modal.jsx`)
- Max-width presets dynamically adapt: on mobile devices, modals expand to `w-[calc(100%-2rem)]` with full-bleed touch targets (min 44px height).

### 2.3 Navigation Drawer (`Sidebar.jsx`)
- Desktop: Stays pinned left with zero layout shift during route navigation.
- Mobile: Toggled via hamburger button in `Navbar.jsx`, dismissing automatically when a destination route is tapped.
