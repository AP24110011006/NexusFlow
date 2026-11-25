# NexusFlow — Visual Theming & Multi-Tag Taxonomy UI Patterns
**Document Reference:** NF-UX-W3-THEME-001  
**Author:** Likhitha (Frontend Core & UI/UX Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849 (Koneti Manikanth)  
**Review Date:** 25 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary

As the visual rule builder complexity scales with dozens of simultaneous rule branches, sensor modalities, and severity tiers, operators require fast perceptual categorization:
1. **Node Theming (`ColorPicker.jsx`):** Visual accenting for rules, pipelines, and trigger states with WCAG 2.1 contrast compliance.
2. **Multi-Tag Taxonomy (`FilterChipBar.jsx`):** Compact multi-select filtering across device zones, hardware protocols (MQTT, Modbus, OPC-UA), and severity classifications.

---

## 2. Component Design Specifications

### 2.1 `ColorPicker.jsx`
- **Presets Palette:** 8 curated industrial hex swatches (Emerald `#10B981`, Sky `#0EA5E9`, Amber `#F59E0B`, Rose `#F43F5E`, Indigo `#6366F1`, Cyan `#06B6D4`, Violet `#8B5CF6`, Slate `#64748B`).
- **Custom Hex Input:** Monospace input with automatic 6-character regex format validation (`/^#[0-9A-Fa-f]{6}$/`).
- **Focus & Popover Management:** Controlled click-outside handler dismissing popover smoothly without layout thrashing.

### 2.2 `FilterChipBar.jsx`
- **Dynamic Chip Rendering:** Active state styling (`bg-sky-500/20 text-sky-300 border-sky-500/40`) vs inactive slate borders.
- **Micro Badge Counts:** Renders contextual count badges for each category.
- **Bulk Dismiss:** Single-click "Clear all (N)" action resetting filter state instantly.

---

## 3. Accessibility & Keyboard Navigation (WAI-ARIA)

- `ColorPicker`: Trigger exposes `aria-haspopup="true"` and dynamic `aria-expanded` attributes.
- `FilterChipBar`: Each pill exposes `aria-pressed="true|false"` for screen readers to recognize toggled filter states.

Signed: Likhitha, Frontend Core Lead, Infotact Solutions
