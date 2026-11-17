# NexusFlow — Sensor Cross-Metric Correlation & Covariance Methodology
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 2 — Multi-Variable Correlation Diagnostics  

---

## 1. Physical Motivation for Cross-Metric Analytics

In complex industrial facilities, physical channels rarely operate in isolation. For instance:
- **Ideal Gas Behavior:** In sealed pressurized boilers, Temperature and Pressure exhibit strong positive coupling ($r \to +1.0$):
  $$P \propto T$$
- **Evaporative Cooling:** In cooling towers, rising Humidity frequently coincides with lowering Temperature ($r \to -1.0$).
- **Sensor Cross-Talk:** If an ambient pressure transducer falsely mimics electric heating fluctuations, $r$ unexpectedly spikes toward $1.0$, indicating capacitive or ground-loop electrical interference rather than genuine physical changes.

---

## 2. Pearson Correlation Formula & Numerical Stability

For time-aligned sample series $X = \{x_1, \dots, x_n\}$ and $Y = \{y_1, \dots, y_n\}$:

$$r_{xy} = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^n (x_i - \bar{x})^2} \sqrt{\sum_{i=1}^n (y_i - \bar{y})^2}}$$

Where:
- $\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i$ and $\bar{y} = \frac{1}{n}\sum_{i=1}^n y_i$
- Clamped strictly to $[-1.0, 1.0]$ to guard against floating-point IEEE 754 precision artifacts.

---

## 3. Heatmap Palette & Diagnostic Rules

| Pearson $r$ Range | Color Token | Physical Significance | Operational Diagnosis |
|---|---|---|---|
| **$+0.80 \le r \le +1.00$** | Emerald / Cyan Glow | Strong Direct Coupling | Thermodynamic expansion / Normal coupled loop |
| **$+0.20 \le r < +0.80$** | Soft Emerald | Moderate Direct Trend | Normal secondary interaction |
| **$-0.20 < r < +0.20$** | Slate Neutral | Independent Variables | Decoupled sensor channels |
| **$-0.80 < r \le -0.20$** | Soft Purple | Moderate Inverse Trend | Evaporative cooling / Ventilation cycle |
| **$-1.00 \le r \le -0.80$** | Rose Coral | Strong Inverse Coupling| Strict conservation equilibrium |
