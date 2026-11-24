# NexusFlow — Week 3: Activity Timelines & SVG Bezier Flow Connectors
**Author:** Likhitha (Frontend Core & UI Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Historiography & Flow Ergonomics

---

## 1. Executive Summary

Industrial operations require both **chronological retrospective transparency** (who changed a safety threshold, when did an alert escalate, who resolved an incident) and **live spatial interconnectivity** (visualizing how triggers feed into condition nodes and downstream actuators).

Week 3 introduces the **NexusFlow Timeline Component** (`frontend/src/components/common/Timeline.jsx`) and the **SVG Cubic Bezier FlowConnector** (`frontend/src/components/common/FlowConnector.jsx`).

---

## 2. Activity Timeline UI Architecture

```
+-----------------------------------------------------------------------------------------+
| Activity & Audit History                                                                |
+-----------------------------------------------------------------------------------------+
|   |                                                                                     |
|  (o) [14:22:00]  RULE_TRIGGERED: High Temperature on DEV-001 (88.4°C)                    |
|   |              Severity: Critical | Escalation: Level 1 Dispatched                    |
|   |                                                                                     |
|  (o) [14:32:00]  ESCALATION_ADVANCED: Level 2 Webhook Dispatched to Ops Slack           |
|   |              Actor: escalation_engine | Target: plant_supervisor                    |
|   |                                                                                     |
|  (o) [14:36:15]  ALERT_ACKNOWLEDGED: Operator Alice acknowledged incident              |
|   |              Actor: usr_alice (Operator) | Memo: "Investigating coolant valve"      |
|   |                                                                                     |
+-----------------------------------------------------------------------------------------+
```

### Key UI Features:
- **Continuous Vertical Spine:** Unbroken SVG vertical alignment passing through status indicator dots.
- **Color-Coded Status Rings:** Emerald for resolutions, amber for warnings, rose for critical breaches, blue for normal operations.
- **Actor Badges:** Displays authenticated actor name, role tag, and structured JSON metadata.

---

## 3. Cubic Bezier Flow Connector Formulation

In visual node flow charts, rigid orthogonal or straight diagonal lines intersect awkwardly with adjacent cards. `FlowConnector.jsx` renders a smooth cubic Bezier curve:

$$\mathbf{B}(t) = (1-t)^3 \mathbf{P}_0 + 3(1-t)^2 t \mathbf{P}_1 + 3(1-t) t^2 \mathbf{P}_2 + t^3 \mathbf{P}_3, \quad t \in [0, 1]$$

Where:
- $\mathbf{P}_0 = (X_{\text{start}}, Y_{\text{start}})$: Source node output port
- $\mathbf{P}_1 = (X_{\text{start}} + \Delta x, Y_{\text{start}})$: Horizontal tangent anchor
- $\mathbf{P}_2 = (X_{\text{end}} - \Delta x, Y_{\text{end}})$: Horizontal tangent anchor
- $\mathbf{P}_3 = (X_{\text{end}}, Y_{\text{end}})$: Target node input port
- $\Delta x = \max(0.5 \cdot |X_{\text{end}} - X_{\text{start}}|, 40\text{px})$

---

## 4. Design System Integration

Unified across the frontend system via [`frontend/src/components/common/index.js`](file:///c:/NexusFlow/frontend/src/components/common/index.js).

*Prepared by:* Likhitha (Frontend Core Lead)  
*Date:* November 2026
