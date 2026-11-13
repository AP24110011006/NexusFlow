# NexusFlow — Frontend UI Component Inventory & Specs
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Reusable Component Library Standardization  

---

## 1. Component Library Architecture

The `frontend/src/components/common` directory encapsulates atomic, highly accessible UI components engineered to enforce visual consistency across all 8 modules of NexusFlow.

```
frontend/src/components/common/
  ├── Button.jsx    # Primary, secondary, outline, danger actions
  ├── Card.jsx      # Glassmorphic container with header & body
  ├── Badge.jsx     # Semantic status tags with animated ping indicator
  ├── Modal.jsx     # Accessible dialogs with ESC dismiss & focus traps
  └── Toast.jsx     # Operational event notifications & alert toasts
```

---

## 2. Component Specifications

### 2.1 `Button.jsx`
- **Props:**
  - `variant`: `'primary'` | `'secondary'` | `'danger'` | `'ghost'` | `'outline'`
  - `size`: `'sm'` (28px) | `'md'` (36px) | `'lg'` (44px)
  - `icon`: React Lucide icon reference
  - `disabled`: Boolean
  - `onClick`: Event handler
- **Interactions:** Dynamic scale micro-animation (`active:scale-95`).

### 2.2 `Card.jsx`
- **Props:**
  - `title`: String or ReactNode for card header
  - `subtitle`: Optional descriptive subtext
  - `headerRight`: Action slot (e.g., refresh button, badge)
  - `children`: Main content body
  - `className`: Optional Tailwind overrides
- **Aesthetic:** Translucent `bg-slate-900/75` with `backdrop-blur-md` and `border border-slate-800/80`.

### 2.3 `Badge.jsx`
- **Props:**
  - `variant`: `'success'` | `'warning'` | `'danger'` | `'info'` | `'neutral'` | `'purple'`
  - `pulse`: Boolean (renders animated concentric pulsing dot)
  - `size`: `'sm'` | `'md'` | `'lg'`
  - `icon`: Optional Lucide icon reference

### 2.4 `Modal.jsx`
- **Props:**
  - `isOpen`: Boolean controlling render
  - `onClose`: Callback invoked on backdrop click, close button, or ESC key
  - `title`: Header label
  - `maxWidth`: `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'`
- **Accessibility:** Traps body scroll (`overflow: hidden`), sets `role="dialog"` and `aria-modal="true"`.

### 2.5 `Toast.jsx`
- **Props:**
  - `message`: Text content
  - `type`: `'success'` | `'warning'` | `'error'` | `'info'`
  - `onClose`: Dismiss callback
  - `duration`: Auto-dismiss timer (default 4000ms)

---

## 3. Accessibility & Keyboard Navigation Matrix

| Component | Target Standard | Keyboard Trigger | Screen Reader Attribute |
|---|---|---|---|
| `Button` | WCAG 2.1 AA | `Enter`, `Space` | `aria-disabled` |
| `Modal` | WAI-ARIA Dialog | `Escape` to close | `role="dialog"`, `aria-labelledby` |
| `Toast` | WCAG Alert | Focusable close button | `role="alert"` |
| `Badge` | WCAG Non-text | N/A (Status Indicator) | Inline text label |
