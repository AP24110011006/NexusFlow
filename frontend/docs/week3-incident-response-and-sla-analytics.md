# NexusFlow — Week 3: Incident Response Kinetics & SLA Analytics Methodology
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Analytics & Mathematical Methodology

---

## 1. Executive Summary

In automated plant operations, alert generation is only half of the reliability equation. The operational response pipeline—how quickly operators acknowledge an anomaly (MTTA) and how swiftly the underlying issue is resolved (MTTR)—directly determines whether a sensor spike remains an isolated event or escalates into factory-wide unplanned downtime.

Week 3 introduces the **Incident Response Analytics Engine** (`frontend/src/utils/incidentMetricsMath.js`) and the **Incident Response Scorecard Widget** (`frontend/src/components/widgets/IncidentResponseScorecard.jsx`).

---

## 2. Mathematical Formulations

### 2.1 Mean Time to Acknowledge (MTTA)
Quantifies operator responsiveness:

$$\text{MTTA} = \frac{1}{n} \sum_{i=1}^n \left(T_{\text{ack}, i} - T_{\text{create}, i}\right)$$

*Unit:* Minutes. Benchmark target: $\le 15\text{ min}$.

---

### 2.2 Mean Time to Resolve (MTTR)
Measures the duration from incident inception until final closure:

$$\text{MTTR} = \frac{1}{n} \sum_{i=1}^n \left(T_{\text{resolve}, i} - T_{\text{create}, i}\right)$$

*Unit:* Minutes. Benchmark target: $\le 60\text{ min}$.

---

### 2.3 SLA Compliance Rate ($\eta_{\text{SLA}}$)
The proportion of resolved incidents that met the pre-contracted resolution SLA window ($T_{\text{target}}$):

$$\eta_{\text{SLA}} = \left(\frac{N_{\text{compliant}}}{N_{\text{resolved}}}\right) \times 100\%$$

Where $N_{\text{compliant}}$ represents incidents where:

$$(T_{\text{resolve}, i} - T_{\text{create}, i}) \le T_{\text{target}}$$

---

### 2.4 Escalation Funnel Distribution
Measures the effectiveness of frontline operators in resolving alerts before supervisor escalation:

$$\text{Ratio}_{L1} = \frac{N_{L1}}{N_{\text{total}}}, \quad \text{Ratio}_{L2} = \frac{N_{L2}}{N_{\text{total}}}, \quad \text{Ratio}_{L3} = \frac{N_{L3}}{N_{\text{total}}}$$

*Target Operational Distribution:* $\ge 70\% L1$, $\le 25\% L2$, $\le 5\% L3$ (emergency cutoffs).

---

## 3. UI Widget Integration

Implemented in `IncidentResponseScorecard.jsx` featuring:
- Real-time MTTA and MTTR cards with target threshold comparison
- Dynamic multi-segment progress bar reflecting the escalation funnel
- Color-coded SLA compliance badge (`emerald` $\ge 90\%$, `amber` $< 90\%$)

*Prepared by:* Harshitha (Frontend Analytics Lead)  
*Date:* November 2026
