# NexusFlow — Frontend UI Style Guide & Design System
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — UI Standardization & Design Token Specifications  

---

## 1. Visual Theme Philosophy: Industrial Glassmorphism Dark Mode
NexusFlow's interface is architected around an immersive industrial operations control room aesthetic. Dark backgrounds reduce eye strain during continuous telemetry monitoring, while high-contrast neon accents (Cyan, Emerald, Amber, Rose) immediately draw attention to status changes and operational alerts.

---

## 2. Color System & Semantic Palette

### 2.1 Base Surface Colors
- **App Canvas:** `#0b0f19` (`bg-slate-950`) — Deep void backdrop for contrast.
- **Card Surface:** `rgba(15, 23, 42, 0.75)` (`bg-slate-900/75`) — Translucent frosted glass.
- **Surface Border:** `rgba(51, 65, 85, 0.4)` (`border-slate-800/80`) — Subtle structure line.
- **Hover Surface:** `rgba(30, 41, 59, 0.8)` (`hover:bg-slate-800/80`) — Micro-feedback layer.

### 2.2 Semantic Status Accents
| Status | Accent Color | Hex Code | Tailwind Utility Class | Usage |
|---|---|---|---|---|
| **Active / Optimal** | Emerald Neon | `#10b981` | `text-emerald-400`, `bg-emerald-500/10` | Normal sensor readings, online status |
| **Telemetry Primary** | Cyan Glow | `#06b6d4` | `text-cyan-400`, `bg-cyan-500/10` | Primary graphs, gauges, navigation active |
| **Warning / Elevated** | Amber | `#f59e0b` | `text-amber-400`, `bg-amber-500/10` | Medium severity alerts, fluctuating readings |
| **Critical / Breach** | Rose Coral | `#f43f5e` | `text-rose-400`, `bg-rose-500/10` | High temperature spikes, offline devices |
| **Rule / Automation** | Violet Indigo | `#8b5cf6` | `text-purple-400`, `bg-purple-500/10` | Rule predicates, triggers, cron conditions |

---

## 3. Typography Scale

NexusFlow standardizes on modern system font sans-serif typography (`Inter`, system UI font stack) paired with tabular monospaced numbers for sensor metrics:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Element | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|
| Page Header | `text-2xl` (24px) | `font-bold` (700) | `leading-tight` | `tracking-tight` |
| Section Title | `text-lg` (18px) | `font-semibold` (600) | `leading-snug` | Normal |
| Card Title | `text-sm` (14px) | `font-semibold` (600) | `leading-normal` | Normal |
| Telemetry Value | `text-3xl` (30px) | `font-black` (900) | `leading-none` | `tabular-nums` |
| Body Text | `text-sm` (14px) | `font-normal` (400) | `leading-relaxed` | Normal |
| Meta / Caption | `text-xs` (12px) | `font-medium` (500) | `leading-normal` | `tracking-wide uppercase` |

---

## 4. Reusable Component Rules

### 4.1 Buttons (`Button.jsx`)
- Supports variants: `primary`, `secondary`, `danger`, `ghost`, `outline`.
- Must include icon prop for operational clarity.
- Active click micro-interaction: `active:scale-95`.

### 4.2 Cards (`Card.jsx`)
- Utilizes `backdrop-blur-md` with `border border-slate-800/80` for depth without opacity obstruction.
- Standard padding: `p-5` with `rounded-2xl`.

### 4.3 Badges (`Badge.jsx`)
- Pill-shaped (`rounded-full`) with optional real-time animated pulse ring for active streaming indicators.

---

## 5. Responsive Grid & Breakpoints
- **Mobile (`< 768px`):** Single column stack, collapsible drawer sidebar.
- **Tablet / Laptop (`768px – 1280px`):** 2-column telemetry grid, fixed 64px compact icon sidebar.
- **Desktop Pro (`> 1280px`):** 3 to 4 column telemetry grid, expanded 240px sidebar with live node badges.
