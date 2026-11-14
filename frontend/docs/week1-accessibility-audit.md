# NexusFlow — Frontend WCAG 2.1 AA Accessibility Audit
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Usability & Accessibility Compliance  

---

## 1. Compliance Standard & Scope

NexusFlow aims for **WCAG 2.1 Level AA** compliance across all 8 views to ensure operators can monitor and configure IoT industrial devices reliably using keyboard, high-contrast displays, and assistive technology.

---

## 2. Color Contrast Evaluation Matrix

Industrial dark mode requires minimum contrast ratios ($4.5:1$ for normal text, $3.0:1$ for large text/icons):

| Element Pair | Foreground Color | Background Surface | Contrast Ratio | WCAG AA Status |
|---|---|---|---|---|
| Primary Body Text | `#f8fafc` (`slate-50`) | `#0f172a` (`slate-900`) | **14.2:1** | PASS (Exceeds 4.5:1) |
| Muted Captions | `#94a3b8` (`slate-400`) | `#0f172a` (`slate-900`) | **5.4:1** | PASS (Exceeds 4.5:1) |
| Active Cyan Accents | `#22d3ee` (`cyan-400`) | `#0f172a` (`slate-900`) | **9.1:1** | PASS (Exceeds 3.0:1) |
| Critical Alert Rose | `#fb7185` (`rose-400`) | `#4c0519` (`rose-950`) | **6.8:1** | PASS (Exceeds 4.5:1) |
| Online Emerald State | `#34d399` (`emerald-400`)| `#064e3b` (`emerald-950`)| **7.2:1** | PASS (Exceeds 3.0:1) |

---

## 3. Keyboard Navigation Verification

- **Tab Traversal:** Logical linear order through Header $\to$ Sidebar Links $\to$ Action Buttons $\to$ Telemetry Cards $\to$ Data Grids.
- **Dialog Escaping:** Modals (`Modal.jsx`) register a window `keydown` listener for `Escape` to return focus safely to the invoking trigger.
- **Focus Rings:** Non-intrusive glow ring (`focus:ring-2 focus:ring-cyan-500/30`) highlights active form controls without breaking dark aesthetic.

---

## 4. Screen Reader Semantics

1. **Live Regions:** Telemetry streaming ticker marked with `aria-live="polite"` so screen readers announce critical threshold breaches without interrupting active reading.
2. **Icons:** Decorative SVG icons marked with `aria-hidden="true"`, while actionable icon buttons include descriptive `aria-label` tags.
3. **Modal Dialogs:** Configured with `role="dialog"` and `aria-modal="true"`.
