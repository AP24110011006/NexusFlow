# NexusFlow — Advanced Anomaly Detection & Signal Filtering Algorithms
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Advanced Analytical Algorithms  

---

## 1. Algorithmic Overview

Industrial telemetry streams are subject to both high-frequency ADC measurement noise and genuine sudden hazard spikes (thermal runaways, boiler overpressure, sudden pipe depressurization). NexusFlow implements a multi-tier analytical detection pipeline:

```
[ Raw Sensor Telemetry Stream ]
                 │
                 ▼
     [ 3-Point Median Filter ]  ───> Eliminates single-tick ADC electrical spikes
                 │
                 ▼
 [ Exponential Moving Average (EMA) ] ───> Establishes smoothed thermal baseline
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
[ Rate-of-Change ]   [ Dynamic Bollinger Bands ]
(ΔV / Δt > Limit)   (V > Mean + 2.5 * σ)
        │                 │
        └────────┬────────┘
                 │
                 ▼
     [ Flag Anomaly Breach in UI ]
```

---

## 2. Mathematical Formulations

### 2.1 Exponential Moving Average (EMA)
Given a sequence $\{x_t\}$ and smoothing factor $\alpha = 0.2$:
$$S_t = \alpha x_t + (1 - \alpha) S_{t-1}$$
Provides a continuous rolling baseline that adapts to ambient day/night thermal shifts without lagging behind real trends.

### 2.2 Rate of Change ($\Delta V / \Delta t$)
$$\mathcal{R} = \frac{|x_t - x_{t-1}|}{\Delta t}$$
If $\mathcal{R} > \mathcal{R}_{\max}$ (e.g. $> 5.0^\circ\text{C}/\text{sec}$), an emergency rate-of-change alert triggers immediately, even if absolute temperature has not yet crossed the static threshold $\theta$.

### 2.3 Dynamic Threshold Envelopes
$$\text{Upper Band}_t = \mu_w(t) + k \cdot \sigma_w(t)$$
$$\text{Lower Band}_t = \mu_w(t) - k \cdot \sigma_w(t)$$
Where $w = 10$ ticks and $k = 2.0$. This flags statistical anomalies that are abnormal for the local operational context.
