# NexusFlow — Chart & Visual Analytics Specifications
**Author:** Harshitha (Frontend Role — Analytics, Widgets & QA)  
**Milestone:** Week 1 Deliverable — Visual Data Analytics Specification  

---

## 1. Visual Analytics Engine
The NexusFlow Visual Analytics tier converts high-frequency multidimensional sensor packets into human-interpretable vector graphs using **Recharts**.

### 1.1 Time Horizons & Aggregation Intervals
| Range | Lookback Window | Bucket Interval | Target Points |
|---|---|---|---|
| **1h** | Last 60 minutes | 30 seconds | ~120 points |
| **6h** | Last 6 hours | 3 minutes | ~120 points |
| **24h** | Last 24 hours | 12 minutes | ~120 points |
| **7d** | Last 7 days | 84 minutes | ~120 points |

### 1.2 Metric Color Tokens & Threshold Encodings
- **Temperature:** `#06b6d4` (Cyan Baseline) $\rightarrow$ `#f43f5e` (Breach $> 40^\circ\text{C}$)
- **Humidity:** `#10b981` (Emerald Baseline) $\rightarrow$ `#fbbf24` (Breach $< 30\%$)
- **Pressure:** `#a855f7` (Purple Baseline) $\rightarrow$ `#f43f5e` (Overpressure $> 1028\text{ hPa}$)
