# NexusFlow — Week 2: Micro-Visualizations & Inline Sparkline Architecture
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 2 Analytics & Visualizations Deliverable

---

## 1. Executive Summary

In high-density industrial control panels displaying dozens of devices simultaneously, full-sized time-series line charts overwhelm viewport boundaries and degrade browser DOM performance. Operators need at-a-glance visibility into telemetry volatility, recent trends, and threshold proximity without expanding full detail views.

Week 2 introduces the **Sensor Volatility Sparkline Widget** (`frontend/src/components/widgets/SensorVolatilitySparkline.jsx`), engineered with lightweight vector SVG rendering, dynamic trend indicators, and threshold boundary markers.

---

## 2. Component Design & Coordinate Math

```
+-------------------------------------------------------------------------+
| Sensor: Temperature (°C)                                                |
| Value:  42.8 °C                                                         |
| Sparkline:                                                              |
|       .---.      /\_             - - - - - - [ Threshold: 45.0 °C ]    |
|      /     \    /   \     _/\                                           |
|     /       \__/     \___/   \-(*)   [^ Upward Trend]                   |
|    +-----------------------------+                                      |
|    Min: 31.2 °C      Max: 43.1 °C                                       |
+-------------------------------------------------------------------------+
```

### Coordinate Normalization Formulation:
For a sensor value $v_i$ within an $N$-point series:

$$x_i = \text{padding} + \left(\frac{i}{N - 1}\right) \cdot (W - 2 \cdot \text{padding})$$

$$y_i = H - \text{padding} - \left(\frac{v_i - \min(V)}{\max(V) - \min(V)}\right) \cdot (H - 2 \cdot \text{padding})$$

Where $W = 140\text{px}$, $H = 36\text{px}$, and $\text{padding} = 4\text{px}$.

---

## 3. Performance & Memory Profile

- **Zero External Heavy Charting Overhead:** Pure SVG `<path>` and `<circle>` elements with zero canvas context switching or DOM bloat.
- **Trend Detection:** Evaluates first vs last reading delta ($\Delta = y_n - y_0$) to display real-time direction vectors (`TrendingUp`, `TrendingDown`, `Minus`).
- **Dynamic Threshold Guide:** Dashed red line (`strokeDasharray="2 2"`) dynamically rendered at the threshold coordinate.

---

## 4. Barrel Unification & Exports

Unified with all analytics widgets and utilities via [`frontend/src/components/widgets/index.js`](file:///c:/NexusFlow/frontend/src/components/widgets/index.js) and [`frontend/src/utils/index.js`](file:///c:/NexusFlow/frontend/src/utils/index.js).

*Prepared by:* Harshitha (Frontend Analytics Lead)  
*Date:* November 2026
