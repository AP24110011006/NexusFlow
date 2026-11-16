# NexusFlow — Device Health Index & Reliability Scoring Algorithm
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 2 — Advanced Device Reliability Analytics  

---

## 1. Algorithmic Overview

Industrial IoT monitoring requires a singular synthesized metric that signals whether a remote sensor node requires field technician servicing before catastrophic hardware failure occurs. The **Composite Device Health Index** ($H$) continuously aggregates power supply, radio transmission quality, and recent condition violations.

---

## 2. Mathematical Formulation

$$H = w_{\text{batt}} \cdot S_{\text{batt}} + w_{\text{anomaly}} \cdot S_{\text{anomaly}} + w_{\text{rssi}} \cdot S_{\text{rssi}}$$

Subject to normalized weight constraints:
$$\sum w_i = 0.40 + 0.35 + 0.25 = 1.00$$

### 2.1 Battery Factor ($S_{\text{batt}} \in [0, 100]$)
$$S_{\text{batt}} = \text{clamp}(B, 0, 100)$$

### 2.2 RF Link Factor ($S_{\text{rssi}} \in [0, 100]$)
Given physical receiver sensitivity boundaries: $\text{RSSI}_{\min} = -100\text{ dBm}$ (packet loss threshold) and $\text{RSSI}_{\max} = -40\text{ dBm}$ (line-of-sight saturation):
$$S_{\text{rssi}} = \left( \frac{\text{clamp}(\text{RSSI}, -100, -40) - (-100)}{-40 - (-100)} \right) \times 100$$

### 2.3 Incident Penalty Factor ($S_{\text{anomaly}} \in [0, 100]$)
$$S_{\text{anomaly}} = \max(0, 100 - 25 \times N_{\text{activeAlerts}})$$

---

## 3. Operational Classification & Field Actions

| Index Score ($H$) | Status Rating | UI Theme | Recommended Action |
|---|---|---|---|
| **$80 \le H \le 100$** | `OPTIMAL` | Emerald Glow | Normal continuous operations; no maintenance needed. |
| **$50 \le H < 80$** | `DEGRADED` | Amber Warning | Schedule battery inspection or antenna alignment within 48h. |
| **$0 \le H < 50$** | `CRITICAL` | Rose Coral | Immediate technician dispatch required; hardware failure imminent. |
