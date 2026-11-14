# NexusFlow — Rule Engine Logical Specification & Evaluation Lifecycle
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 1 — Rule Engine Logic & Condition Engine  

---

## 1. Mathematical Logic Formulation

The NexusFlow Rule Engine models industrial threshold rules as predicate tuples:

$$\mathcal{R} = \langle M, \odot, \theta, S, \Delta t \rangle$$

Where:
- $M \in \{\text{temperature}, \text{humidity}, \text{pressure}, \text{battery}, \text{rssi}\}$ (Observed Metric)
- $\odot \in \{>, <, \ge, \le, ==, \ne\}$ (Relational Operator)
- $\theta \in \mathbb{R}$ (Threshold Scalar)
- $S \in \{\text{low}, \text{medium}, \text{high}, \text{critical}\}$ (Alert Severity)
- $\Delta t \in \mathbb{N}^+$ (Cooldown Debounce Interval in seconds)

For an incoming telemetry packet $P$, the condition evaluates to:

$$E(P, \mathcal{R}) = \begin{cases} 
\text{TRUE} & \text{if } P[M] \odot \theta \\
\text{FALSE} & \text{otherwise}
\end{cases}$$

---

## 2. Operator Truth Table & Epsilon Handling

Floating-point equality in JavaScript requires an epsilon boundary ($\varepsilon = 10^{-4}$) to prevent IEEE 754 precision artifacts:

| Operator | Syntax | Condition Truth Criteria | Example Evaluation |
|---|---|---|---|
| `>` | Strictly Greater | $v - \theta > 0$ | $45.2 > 40.0 \implies \text{TRUE}$ |
| `<` | Strictly Less | $\theta - v > 0$ | $28.5 < 30.0 \implies \text{TRUE}$ |
| `>=` | Greater or Equal | $v \ge \theta - \varepsilon$ | $40.0 \ge 40.0 \implies \text{TRUE}$ |
| `<=` | Less or Equal | $v \le \theta + \varepsilon$ | $30.0 \le 30.0 \implies \text{TRUE}$ |
| `==` | Numeric Equal | $\|v - \theta\| < \varepsilon$ | $\|40.0001 - 40.0\| < 10^{-4} \implies \text{TRUE}$ |
| `!=` | Numeric Inequality | $\|v - \theta\| \ge \varepsilon$ | $45.0 \ne 40.0 \implies \text{TRUE}$ |

---

## 3. Cooldown & Flapping Prevention Mechanism

When sensor readings oscillate around a threshold boundary (e.g. $40.02^\circ\text{C} \to 39.98^\circ\text{C} \to 40.01^\circ\text{C}$), a naive rule engine creates an alert storm.

NexusFlow implements a time-based hysteresis debounce window:

```
[ Rule Condition Matches: TRUE ]
                 │
                 ▼
    [ Elapsed Time Since Last Trigger ]
                 │
        ┌────────┴────────┐
        │                 │
    < Cooldown        >= Cooldown
        │                 │
        ▼                 ▼
 [ Suppress Alert ]   [ Dispatch Alert ]
 (Log Debounce Tick)  (Emit Socket.IO & Save Alert)
```

The default cooldown window is set to $60\text{ seconds}$ per rule-device pair.
