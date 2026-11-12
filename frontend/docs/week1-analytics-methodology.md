# NexusFlow — Frontend Analytics & Statistical Methodology
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Mathematical Foundations & Time-Series Algorithms  

---

## 1. Mathematical Formulation for Telemetry Aggregations

NexusFlow translates raw incoming high-frequency IoT readings into actionable operator statistics using standard mathematical formulations implemented in `frontend/src/utils/telemetryMath.js`.

### 1.1 Arithmetic Mean ($\mu$)
For a window of $N$ sensor observations $\{x_1, x_2, \dots, x_N\}$:
$$\mu = \frac{1}{N}\sum_{i=1}^{N} x_i$$
Used to establish baseline operational temperatures and pressures across industrial zones.

### 1.2 Sample Standard Deviation ($s$)
To measure signal stability and detect turbulent thermal spikes:
$$s = \sqrt{\frac{1}{N - 1}\sum_{i=1}^{N}(x_i - \mu)^2}$$
High variance indicates unstable environmental controls or sensor degradation.

### 1.3 Statistical Outlier Detection via Z-Score
Points with a $|Z| > 2.5$ are marked as candidate hardware faults or transient spikes:
$$Z_i = \frac{x_i - \mu}{s}$$

---

## 2. Real-Time Time-Series Downsampling Strategy

Rendering thousands of raw DOM SVG elements in SVG-based chart engines (Recharts) degrades frame rates below 30 FPS. NexusFlow implements two-tier downsampling:

1. **Sliding Ring Buffer:** Caps client-side in-memory history to the most recent 60 observations per device channel.
2. **Uniform Stride Downsampling:** When user selects historical ranges (> 24 hours), the `downsampleTimeSeries(data, maxPoints)` function computes:
   $$k = \left\lceil \frac{N}{M} \right\rceil$$
   selecting every $k$-th point while strictly preserving the terminal observation $x_N$ to represent current state accurately.

---

## 3. Chart Rendering Performance Guidelines

1. **Animation Disabling for Streaming:** In `LineChart` and `AreaChart`, set `isAnimationActive={false}` for high-frequency live WebSocket feeds to prevent continuous tween overhead.
2. **Selective Tooltip Rendering:** Wrap custom SVG tooltips in React `memo` to avoid re-rendering background paths when cursor coordinates update.
3. **Responsive Container Height:** Standardize widget chart containers at `h-64` (256px) for telemetry cards and `h-80` (320px) for the comparative multi-axis view in Module 6 (`Analytics.jsx`).
