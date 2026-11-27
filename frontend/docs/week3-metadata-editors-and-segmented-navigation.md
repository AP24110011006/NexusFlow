# NexusFlow — Key-Value Metadata Editors & Segmented Navigation
**Document Reference:** NF-UX-W3-META-001  
**Author:** Likhitha (Frontend Core & UI/UX Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849 (Koneti Manikanth)  
**Review Date:** 27 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary

As telemetry ingestion pipelines and rule engines support distributed integrations, user interfaces require flexible, developer-friendly micro-components for parameter configuration and workspace view mode navigation:
1. **`KeyValueEditor.jsx`:** Dynamic dictionary authoring for HTTP headers, MQTT topic parameters, sensor offset maps, and custom alert payloads.
2. **`SegmentedControl.jsx`:** Tactile sliding pill selector conforming to WAI-ARIA Radio Group accessibility patterns for fast viewport mode transitions.

---

## 2. Component Design Specifications

### 2.1 `KeyValueEditor.jsx`
- **Dynamic Row Manipulation:** Instant append (`addRow`), delete (`removeRow`), and auto-clearing for empty states.
- **Sanitized Emits:** Discards trailing empty keys while retaining entered values.
- **Micro Typography:** Monospace input fields (`font-mono`) matching developer expectations for technical keys and values.

### 2.2 `SegmentedControl.jsx`
- **Sliding Pill Indicator:** High-contrast `bg-sky-500 text-white` indicator with soft neon drop shadow (`shadow-sky-500/20`).
- **Keyboard Navigation (WAI-ARIA 2.1):** Supports `ArrowRight`, `ArrowLeft`, `Home`, and `End` keys with roving `tabIndex` (selected is 0, rest are -1).
- **Badge Integration:** Embedded numeric pill counter for notification badges or view counts.

---

## 3. Integration Verification

Both components integrate directly with the NexusFlow Rule Builder Drawer and Telemetry Explorer views, passing production Vite bundle minification with zero warnings.

Signed: Likhitha, Frontend Core Lead, Infotact Solutions
