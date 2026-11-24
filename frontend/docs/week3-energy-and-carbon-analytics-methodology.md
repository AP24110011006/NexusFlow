# NexusFlow — Week 3 Energy, Carbon Footprint & Tariff Analytics Methodology
**Document Reference:** NF-DOC-W3-ENG-001  
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849 (Koneti Manikanth)  
**Review Date:** 24 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary & Purpose

Industrial IoT operations require real-time visibility into power quality, energy consumption ($kWh$), greenhouse gas emissions ($kg\ CO_2e$), and dynamic electricity tariff costs. NexusFlow's Week 3 Energy Analytics module couples real-time sub-second electrical telemetry (voltage, current, power factor) with statutory emission models conforming to:
1. **ISO 50001:2018:** Energy management systems — Requirements with guidance for use.
2. **Central Electricity Authority (CEA) of India (CO2 Baseline Database v19):** Grid emission factor for the Southern Regional Grid ($0.82\ kg\ CO_2e / kWh$).
3. **IEEE 1459-2010:** Standard definitions for the measurement of electric power quantities under sinusoidal, non-sinusoidal, balanced, or unbalanced conditions.

---

## 2. Mathematical Formulations

### 2.1 AC Active, Reactive, and Apparent Power
For single-phase alternating current circuits:
- **Active Power ($P$ in kW):**
  $$P = \frac{V \cdot I \cdot \cos\theta}{1000}$$
  where $V$ is RMS Voltage (Volts), $I$ is RMS Current (Amperes), and $\cos\theta$ is the displacement power factor ($\text{PF}$).

- **Apparent Power ($S$ in kVA):**
  $$S = \frac{V \cdot I}{1000}$$

- **Reactive Power ($Q$ in kVAR):**
  $$Q = \sqrt{S^2 - P^2}$$

### 2.2 Energy Accumulation ($kWh$)
Over discrete telemetry reporting intervals $\Delta t$ (hours):
$$E_{cum} = \sum_{i=1}^{N} P_i \cdot \Delta t_i$$

### 2.3 Carbon Footprint Quantification ($kg\ CO_2e$)
Emissions are calculated proportionally using the statutory grid carbon intensity factor:
$$\text{Carbon Emission } (kg\ CO_2e) = E_{cum} \cdot \kappa_{\text{grid}}$$
where $\kappa_{\text{grid}} = 0.82\ kg\ CO_2e / kWh$ (CEA Southern Region Average).

### 2.4 Time-of-Day (ToD) Tariff Cost Model
$$\text{Total Cost } (\text{INR}) = E_{\text{peak}} \cdot r_{\text{peak}} + E_{\text{off-peak}} \cdot r_{\text{off-peak}} + E_{\text{standard}} \cdot r_{\text{standard}}$$
Default BESCOM Industrial Tariff configuration:
- Standard: ₹7.50 / kWh
- Peak (06:00 - 10:00, 18:00 - 22:00): ₹9.20 / kWh (+22.6% surcharge)
- Off-Peak (22:00 - 06:00): ₹6.00 / kWh (-20.0% concession)

---

## 3. UI Component Integration: `EnergySustainabilityWidget.jsx`

The `EnergySustainabilityWidget` provides industrial plant managers with:
1. **Live Power Telemetry Cards:** Active Power ($kW$), Cumulative Energy ($kWh$), Carbon Footprint ($kg\ CO_2e$), and Accrued Cost ($₹$).
2. **Dynamic Tariff Switcher:** One-click simulation between Peak, Standard, and Off-Peak pricing slabs.
3. **Grid Compliance Meter:** Visual power factor bar measuring deviation from the $0.90$ regulatory benchmark (penalized below $0.85$, incentivized above $0.95$).
4. **Carbon Offset Metric:** Equivalent trees required to sequester the produced carbon over 1 year ($1\text{ tree} \approx 21.77\ kg\ CO_2/\text{year}$).

---

## 4. Verification & Validation Metrics

| Test Scenario | Input Vector ($V, I, \cos\theta, \Delta t$) | Expected Output | Measured Output | Status |
| :--- | :--- | :--- | :--- | :---: |
| High Load Phase A | $415V, 24A, 0.92, 1.0h$ | $9.16\ kW, 9.16\ kWh, 7.51\ kg\ CO_2e$ | $9.16\ kW, 9.16\ kWh, 7.51\ kg\ CO_2e$ | **PASS** |
| Low Power Factor | $230V, 15A, 0.65, 0.5h$ | $2.24\ kW, 1.12\ kWh, 0.92\ kg\ CO_2e$ | $2.24\ kW, 1.12\ kWh, 0.92\ kg\ CO_2e$ | **PASS** |
| Peak Tariff Cost | $100\ kWh$ at Peak (₹9.20) | ₹920.00 | ₹920.00 | **PASS** |

Signed: Harshitha, Frontend Analytics Lead, Infotact Solutions
