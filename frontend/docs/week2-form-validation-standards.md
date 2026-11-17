# NexusFlow — Frontend Form Validation & Error State Standards
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 2 — Form Validation & Error Boundaries  

---

## 1. Validation Philosophy

Industrial operations software must prevent invalid data entry before network dispatch to avoid disrupting downstream hardware or triggering spurious alarms.

NexusFlow implements synchronous client-side validation with real-time field-level error messages:

```
[ User Enters Form Field ] ───> [ OnBlur / OnChange Validation ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                    [ Valid ]                                  [ Invalid ]
                       │                                           │
                       ▼                                           ▼
             Border: Slate-700                           Border: Rose-500/80
             Checkmark icon                              Inline error message in Rose
                                                         Submit button disabled
```

---

## 2. Validation Rules Matrix

| Form Modal | Input Field | Constraint Specification | Error Message |
|---|---|---|---|
| **Add Device** | `deviceId` | Pattern: `^DEV-[0-9]{4}$` | "Device ID must follow DEV-XXXX format." |
| **Add Device** | `name` | Min 3, max 64 characters | "Device name must be 3-64 characters." |
| **Add Device** | `ipAddress` | Valid IPv4 format (`0-255.0-255...`) | "Invalid IPv4 address format." |
| **Create Rule** | `threshold` | Numeric between -50.0 and 1500.0 | "Threshold must be a valid number within physical bounds." |
| **Create Rule** | `cooldownSeconds` | Integer between 5 and 3600 | "Cooldown must be between 5s and 1 hour." |

---

## 3. Visual States
- **Error State:** Input container styled with `border-rose-500/80 bg-rose-950/20 text-rose-100`.
- **Focus Glow:** Transitions from cyan focus ring to rose ring (`focus:ring-rose-500/20`) when an error is present.
- **Screen Reader Support:** Error messages tagged with `aria-live="polite"` and linked via `aria-describedby`.
