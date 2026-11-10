# NexusFlow Frontend Architecture Guide
**Authored by:** Harshitha (Frontend Engineering Role)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Milestone:** Week 1 Deliverable — Frontend Architecture & Component Matrix  

---

## 1. Overview
The NexusFlow frontend tier provides a responsive, real-time industrial telemetry monitoring console built with **React 18**, **Tailwind CSS**, and **Recharts**.

### Key Frontend Subsystems:
1. **Real-Time Data Streaming:** `SocketContext.jsx` manages WebSocket connections to `http://localhost:5000`, receiving live telemetry packets (`telemetry:new`) and rule engine alerts (`alert:new`).
2. **Component Matrix:**
   - `Navbar`: System status indicators, alert bell with live badge count, and user persona switcher.
   - `Sidebar`: Navigation across all 8 core modules.
   - `SimulatorBar`: Sticky interactive test ribbon for pause/resume, frequency tuning, and single-click anomaly spike injection.
   - `TelemetryGauge`: Circular SVG gauges with dynamic threshold colors.
   - `SensorComparisonChart`: Multi-channel cross-node comparative bar chart.
3. **8 Feature Pages:**
   - `Dashboard`: High-level operational overview and live stream charts.
   - `Devices`: Hardware node inventory, MAC/IP management, and connection health.
   - `Telemetry`: High-density live telemetry stream and manual API ingest testing tool.
   - `Rules`: Visual rule engine builder and interactive sandbox simulator.
   - `Alerts`: Incident response lifecycle with audio chimes.
   - `Analytics`: Historical trends and sensor stability calculations ($\sigma$).
   - `Logs`: Categorized system audit trail.
   - `Settings`: Platform preferences, intern credentials, and diagnostics.
