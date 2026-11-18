# NexusFlow — Week 2: Accordion & Disclosure UX Patterns
**Author:** Likhitha (Frontend Core & UI Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 2 Component Deliverable — Disclosure Widgets

---

## 1. Executive Summary

Complex IoT device configuration, rule engine trigger criteria, and threshold telemetry settings require significant screen real estate. Presenting all options simultaneously induces cognitive fatigue and clutter.

Week 2 introduces the **NexusFlow Accordion Component** (`frontend/src/components/common/Accordion.jsx`), a lightweight, accessible disclosure panel capable of single or multi-expand modes, status badges, and smooth state transitions.

---

## 2. Interaction Design & Layout Modes

```
+-------------------------------------------------------------------------+
| [v]  Sensor Ingestion Rules (4 Active)                  [ Active Badge ]|
+-------------------------------------------------------------------------+
|      * Sampling Interval: 5000ms                                        |
|      * Telemetry Metric: Temperature (°C)                               |
|      * Threshold Condition: Value > 45.00                               |
+-------------------------------------------------------------------------+
| [>]  Network & Cellular Connectivity                                    |
+-------------------------------------------------------------------------+
| [>]  Security Credentials & MQTT Broker Settings                        |
+-------------------------------------------------------------------------+
```

### Feature Specifications:

1. **Multi vs Single Expansion Modes:**
   - `allowMultiple={false}`: Standard accordion behavior where opening panel $B$ automatically collapses panel $A$, conserving vertical viewport.
   - `allowMultiple={true}`: Multi-panel disclosure allowing engineers to inspect related network and hardware parameters side-by-side.
2. **Dynamic Badging & Status Icons:**
   - Panel headers accept optional badges (e.g., status badges from `Badge.jsx`) and Lucide icon components to visually communicate health, active rule count, or warning indicators.
3. **Disabled Panels:**
   - Supports `disabled: true` for sections unavailable in current user role or offline devices (`opacity-50 cursor-not-allowed`).

---

## 3. Keyboard Navigation & ARIA Specifications

- Trigger button labeled with `aria-expanded="true|false"` reflecting disclosure state.
- Button linked to collapsible body via `aria-controls="accordion-panel-{id}"`.
- Panel container marked with `role="region"` and `aria-labelledby="accordion-btn-{id}"`.
- Chevron indicator smoothly rotates 180 degrees (`rotate-180`) on expansion using CSS transform transitions.
- When closed, panel receives `hidden` attribute to remove children from tab sequence and accessibility tree.

---

## 4. Integration Examples

Used across NexusFlow for:
- Device Detail Configuration (`frontend/src/pages/Devices.jsx`)
- Rule Condition Inspector (`frontend/src/pages/Rules.jsx`)
- System Settings & Diagnostic Audits (`frontend/src/pages/Settings.jsx`)

*Prepared by:* Likhitha (Frontend Core Lead)  
*Date:* November 2026
