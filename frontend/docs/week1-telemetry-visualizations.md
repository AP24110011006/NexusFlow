# NexusFlow — Telemetry Visualizations & Widget Specifications
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Data Visualization Component Architectures  

---

## 1. Radial Dial & Semi-Circle Telemetry Gauge Specifications

### 1.1 Architecture
Implemented in `frontend/src/components/widgets/TelemetryGauge.jsx`, the gauge converts normalized physical readings into an arc angle from $0^\circ$ to $180^\circ$.

$$\theta = \left(\frac{\text{clamp}(V, V_{\min}, V_{\max}) - V_{\min}}{V_{\max} - V_{\min}}\right) \times 180^\circ$$

### 1.2 SVG Gradient Shading
- **Safe Zone ($0\% - 65\%$):** `#10b981` (Emerald Glow)
- **Warning Zone ($65\% - 85\%$):** `#f59e0b` (Amber Orange)
- **Critical Breach Zone ($85\% - 100\%$):** `#f43f5e` (Rose Coral)

---

## 2. Real-Time Stream Line Charts (`TelemetryChart.jsx`)

1. **Def Elements:** Linear gradient fills with low opacity (`fillOpacity={0.15}`) provide depth without obscuring crosshair grids.
2. **Dynamic Y-Domain Auto-Scaling:** Auto-adjusts with $+/- 5\%$ margin around local min/max values to maintain high vertical visual contrast during small oscillations.
3. **Reference Lines:** Renders dashed horizontal threshold indicators representing user-configured Rule Engine limits directly on the chart plane.

---

## 3. Comparison & Multi-Device Analytics (`Analytics.jsx`)

- Compares up to 5 concurrent sensor streams simultaneously.
- Color assigned dynamically based on device hardware ID hash to maintain persistent color associations across page transitions.
- Synchronized tooltips displaying simultaneous multi-sensor values at any historical timestamp slice.
