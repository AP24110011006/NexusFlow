# NexusFlow — Week 2: Hierarchical Navigation & Breadcrumbs UX Guide
**Author:** Likhitha (Frontend Core & UI Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 2 Component Deliverable — Navigation Architecture

---

## 1. Executive Summary

As the NexusFlow IoT platform scales across distributed physical deployments (e.g., Campus $\rightarrow$ Building $\rightarrow$ Floor $\rightarrow$ Gateway $\rightarrow$ Sensor Device), operators frequently drill down into granular telemetry streams. Without contextual breadcrumb trails, users experience spatial disorientation and high interaction friction when navigating back to higher-level aggregations.

Week 2 introduces the **Hierarchical Breadcrumbs Component** (`frontend/src/components/common/Breadcrumbs.jsx`), designed with W3C WAI-ARIA breadcrumb standards and mobile-first responsive constraints.

---

## 2. Navigation Architecture & Hierarchy Patterns

```
Global Level:
  [ Home / Dashboard ]
       |
       +--> Facility / Zone:
       |      [ Industrial Zone B ]
       |           |
       |           +--> Device Detail:
       |           |      [ Smart HVAC DEV-002 ]
       |           |           |
       |           |           +--> Granular View:
       |           |                  [ Real-time Telemetry & Anomaly Analysis ]
```

### Component Props Matrix:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `Array<BreadcrumbItem>` | `[]` | Array of path segments: `{ label, href, icon, current }` |
| `separator` | `ReactNode` | `<ChevronRight />` | Custom separator glyph or icon |
| `onNavigate` | `Function` | `undefined` | Intercept navigation events for client-side SPA routing (`react-router-dom`) |
| `className` | `string` | `''` | Tailwind utility overrides |

---

## 3. Responsive Truncation Strategy

On constrained mobile viewports (< 640px), nested paths with long device identifiers (e.g., `DEV-VIBRATION-TURBINE-09`) can wrap into multiple unsightly lines:
- **Mobile Viewport:** Middle path segments are truncated with CSS `truncate max-w-[120px]`.
- **Active Leaf Node:** Preserves maximum width (`max-w-[220px]`) and highlights with distinct background badge (`bg-gray-100 dark:bg-gray-800/60`).
- **First Node:** Always renders the `Home` icon to provide an anchor return target.

---

## 4. Accessibility & W3C WAI-ARIA Compliance

- Root container wrapped in semantic `<nav aria-label="Breadcrumb">`.
- Breadcrumb list structured as an ordered list `<ol>` representing the strict hierarchy.
- Terminal / current active item flagged with `aria-current="page"` and rendered as a non-clickable text span to avoid redundant page reloads.
- Visual separators marked with `aria-hidden="true"` so screen readers (NVDA, VoiceOver) do not announce extraneous punctuation.

---

## 5. Verification

Integrated and tested with NexusFlow dark mode theme tokens, screen readers, and Vite production bundle pipeline (`npm run build`).

*Prepared by:* Likhitha (Frontend Core Lead)  
*Date:* November 2026
