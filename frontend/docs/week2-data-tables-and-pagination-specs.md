# NexusFlow — Data Tables & Pagination Design Specifications
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 2 — Tabular Data Presentation & Pagination Standards  

---

## 1. Overview & Data Density Standards

Industrial IoT operators require dense, high-frequency tables (in Module 3: Telemetry Management and Module 7: Event Logs) that present dozens of readings without cognitive overload or horizontal scrolling on desktop monitors.

```
┌────────────────────────────────────────────────────────────────────────┐
│ High-Density Telemetry Stream Table                                    │
│ [Timestamp]     [Device ID]    [Temp]   [Hum]   [Press]  [Status]      │
├────────────────────────────────────────────────────────────────────────┤
│ 09:05:22.140    DEV-1001       28.4°C   45.2%   1013hPa  [OPTIMAL]     │
│ 09:05:21.050    DEV-1002       48.1°C   32.0%   1011hPa  [CRITICAL]    │
│ 09:05:19.890    DEV-1003        4.2°C   84.5%   1015hPa  [OPTIMAL]     │
├────────────────────────────────────────────────────────────────────────┤
│ Showing 1 to 25 of 1,240 results         [Prev] [1] [2] [3] ... [Next] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design Criteria

### 2.1 Pagination (`Pagination.jsx`)
- Supports dynamic page sizing: 10, 25, 50, 100 rows per view.
- Provides Ellipsis pagination algorithm (`1, ..., 4, 5, 6, ..., 50`) to keep page chips within a bounded horizontal width.
- Traversal buttons disable at boundary edges (`disabled:opacity-40`).

### 2.2 Toggle Controls (`Switch.jsx`)
- Accessible ARIA role `switch` with explicit `aria-checked` and keyboard `Space` toggle.
- Used in Rule Management (`Rules.jsx`) to enable/disable rules in real time.

---

## 3. Responsive Table Fallbacks
- On Mobile Viewports (`< 768px`): Wide data tables collapse into stacked cards with key-value grid chips to prevent horizontal page scrolling.
