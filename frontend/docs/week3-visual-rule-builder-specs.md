# NexusFlow — Week 3: Visual Rule Builder & Canvas Node Specifications
**Author:** Likhitha (Frontend Core & UI Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Visual Flow Architecture & Stepper Workflows

---

## 1. Executive Summary

Traditional form-based rule creation interfaces in IoT platforms require multiple nested dropdowns, creating cognitive friction when chaining multi-sensor threshold logic with downstream escalation hooks.

Week 3 introduces the **Visual Rule Canvas Node** (`frontend/src/components/common/RuleCanvasNode.jsx`) and the **Guided Rule Creation Stepper** (`frontend/src/components/common/Stepper.jsx`), bridging tabular configuration with visual node-link flow topology.

---

## 2. Visual Rule Flow Topology

```
+---------------------------------------------------------------------------------------------------+
|                                 NexusFlow Visual Rule Canvas                                      |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ TRIGGER NODE ]               [ CONDITION NODE ]              [ ACTION NODE ]                   |
|  +------------------------+     +------------------------+      +------------------------+        |
|  | DEV-001 (Turbine)      |     | Temp > 80.0 °C         |      | Webhook Dispatch       |        |
|  | Metric: Temperature    |     | Duration: 300s         |      | Target: Slack Ops      |        |
|  | Rate: 1000ms           |     | Severity: Critical     |      | Level: Escalation L2   |        |
|  |                    (o)-+====>+-(o)                (o)-+=====>+-(o)                    |        |
|  +------------------------+     +------------------------+      +------------------------+        |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Node Typology:
1. **Trigger Nodes (Emerald):** Ingests live telemetry streams from registered hardware sensors. Port on right edge (`out`).
2. **Condition Nodes (Amber):** Evaluates mathematical thresholds, anomaly Z-scores, or rate-of-change spikes. Left input port (`in`), right output port (`out`).
3. **Action Nodes (Blue):** Dispatches alarms, webhooks, or failsafe commands. Left input port (`in`).

---

## 3. Guided 4-Step Wizard Stepper

For non-expert plant personnel, the multi-step `Stepper.jsx` wizard standardizes rule compilation into 4 progressive phases:

```
(1) Select Hardware  ----->  (2) Set Conditions  ----->  (3) Action & SLA  ----->  (4) Review & Deploy
    [Completed ✓]                [Active Glow]               [Upcoming]                 [Upcoming]
```

- **Step Validation:** Locks forward navigation until active step criteria pass form schema validation.
- **Responsive Layout:** Automatically condenses step descriptions on tablet/mobile screens while preserving numbered indicator pills.

---

## 4. Module Barrel Exports

Unified across the frontend system via [`frontend/src/components/common/index.js`](file:///c:/NexusFlow/frontend/src/components/common/index.js).

*Prepared by:* Likhitha (Frontend Core Lead)  
*Date:* November 2026
