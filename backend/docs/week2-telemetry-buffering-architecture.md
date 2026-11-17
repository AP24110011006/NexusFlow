# NexusFlow — In-Memory Circular Buffering & Cache Eviction Architecture
**Role:** Backend Lead / Associate L1. Intern  
**Contributor:** Koneti Manikanth (Ref. No.: ITS/WEB/1849)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka)  
**Milestone:** Week 2 — High-Throughput Buffering & Memory Optimization  

---

## 1. Architectural Motivation

In high-frequency IoT environments where each sensor emits telemetry every 1000ms, storing unconstrained time-series arrays in JavaScript process memory causes rapid V8 garbage collection overhead and potential Out-Of-Memory (`heap out of memory`) crashes.

NexusFlow implements a **Circular Ring Buffer** architecture (`backend/services/bufferService.js`) per hardware node to enforce strict memory boundaries:

```
                  ┌──────────────────────┐
                  │ Fixed-Size Buffer    │
                  │ Capacity: N = 1000   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   Index 0: [Reading t0]             Index 999: [Reading t999]
   Index 1: [Reading t1]             (Head wraps back to 0)
   Index 2: [Reading t2]             Overwrites oldest item
```

---

## 2. Computational Complexity & Performance Characteristics

| Operation | Standard Dynamic Array (`push`/`shift`) | NexusFlow Circular Ring Buffer | Improvement |
|---|---|---|---|
| **Append Insertion** | $O(1)$ amortized ($O(N)$ on reallocation) | **$O(1)$ strict** | Eliminates heap reallocation spikes |
| **Eviction of Stale Head**| $O(N)$ (Array element shifting) | **$O(1)$** (Pointer modular increment) | Prevents main thread event loop blockage |
| **Chronological Retrieval**| $O(1)$ | **$O(N)$** (Two-slice array concatenation)| Optimized for fast writing over reads |
| **Memory Ceiling** | Unbounded ($O(t)$ growth) | **Bounded** ($1000 \times \text{devices} \times 240\text{ bytes}$) | Predictable RAM footprint (< 25MB) |

---

## 3. Mathematical Head & Pointer Model

For a ring buffer of capacity $C$ and write counter $W$:

$$\text{Head Index} = W \bmod C$$

$$\text{IsFull} = (W \ge C)$$

$$\text{Chronological Array} = \begin{cases}
B[0 \dots W-1] & \text{if } W < C \\
B[\text{Head} \dots C-1] \mathbin{\Vert} B[0 \dots \text{Head}-1] & \text{if } W \ge C
\end{cases}$$

Where $\mathbin{\Vert}$ denotes array concatenation.
