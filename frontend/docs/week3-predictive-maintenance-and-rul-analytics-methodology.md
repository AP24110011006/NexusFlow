# NexusFlow — Week 3 Predictive Maintenance & RUL Analytics Methodology
**Document Reference:** NF-DOC-W3-RUL-001  
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849 (Koneti Manikanth)  
**Review Date:** 25 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary & Purpose

Modern industrial facility management shifts maintenance paradigms from reactive firefighting to **Condition-Based Predictive Maintenance (PdM)**. In Week 3, NexusFlow integrates mathematical models for **Remaining Useful Life (RUL)** estimation and **Weibull Cumulative Hazard Risk**, conforming to:
1. **ISO 13374:** Condition monitoring and diagnostics of machine systems (Data Acquisition $\rightarrow$ Data Manipulation $\rightarrow$ State Detection $\rightarrow$ Health Assessment $\rightarrow$ Prognostics Assessment).
2. **Weibull Distribution for Industrial Reliability Engineering:** IEEE Standard 493.

---

## 2. Mathematical Formulations

### 2.1 Ordinary Least Squares (OLS) Linear Degradation Trajectory
Given historical degradation observations $\{(t_i, D_i)\}_{i=1}^N$:
$$\text{Slope } m = \frac{N \sum t_i D_i - \sum t_i \sum D_i}{N \sum t_i^2 - (\sum t_i)^2}$$
$$\text{Intercept } c = \frac{\sum D_i - m \sum t_i}{N}$$

### 2.2 Remaining Useful Life (RUL) Calculation
$$RUL_{\text{hours}} = \frac{D_{\text{threshold}} - D_{\text{current}}}{m}$$
$$RUL_{\text{days}} = \frac{RUL_{\text{hours}}}{24}$$

### 2.3 Weibull 2-Parameter Failure Probability
$$F(t) = 1 - \exp\left(-\left(\frac{t}{\eta}\right)^\beta\right)$$
Where:
- $t$: Cumulative equipment runtime hours.
- $\eta$: Characteristic life scale parameter (hours to $63.2\%$ cumulative failure).
- $\beta$: Weibull shape parameter ($\beta = 1$: random exponential failure; $\beta > 1$: wearout degradation regime).

### 2.4 Normalized Asset Health Index ($HI$)
$$HI(\%) = \max\left(0, \min\left(100, \left(1 - \frac{D_{\text{current}} - D_{\text{baseline}}}{D_{\text{threshold}} - D_{\text{baseline}}}\right) \cdot 100\right)\right)$$

---

## 3. UI Component Integration: `PredictiveMaintenanceWidget.jsx`

1. **RUL Countdown:** Real-time countdown in operating days and hours with statistical confidence intervals.
2. **Asset Health Index Gauge:** Normalized 0-100% health bar with dynamic chromatic transitions (emerald $\rightarrow$ amber $\rightarrow$ rose).
3. **Weibull Hazard Severity Badge:** Categorical classification (`NOMINAL`, `ELEVATED`, `CRITICAL`).
4. **Prescriptive Action Suggestion:** Contextual maintenance recommendation (e.g. lubrication, bearing replacement) prior to trip threshold breach.

Signed: Harshitha, Frontend Analytics Lead, Infotact Solutions
