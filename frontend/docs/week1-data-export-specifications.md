# NexusFlow — Telemetry Data Export Technical Specifications
**Role:** Frontend Analytics & Visualizations Engineer  
**Contributor:** Harshitha (Frontend Role)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — Data Portability & Reporting Architecture  

---

## 1. Export Architecture & Client-Side Generation

NexusFlow enables zero-server-load dataset export by assembling RFC 4180-compliant CSV and JSON payloads directly within client memory using modern browser Web APIs:

```
[ In-Memory Telemetry Ring Buffer / Query Cache ]
                         │
                         ▼
          [ User Selects Format & Range ]
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
  [ CSV Serializer ]            [ JSON Serializer ]
  - RFC 4180 Escaping           - Indented Array Stream
  - UTF-8 BOM Prefix            - ISO 8601 Timestamps
          │                             │
          └──────────────┬──────────────┘
                         │
                         ▼
           [ Native Blob Constructor ]
            type: 'text/csv' / 'application/json'
                         │
                         ▼
        [ URL.createObjectURL(blob) ]
                         │
                         ▼
     [ Synthetic Anchor DOM Trigger Click ]
                         │
                         ▼
          [ URL.revokeObjectURL(url) ]
```

---

## 2. File Format Contracts

### 2.1 CSV Specification (RFC 4180)
- **MIME Type:** `text/csv;charset=utf-8;`
- **Header Structure:** `id,deviceId,temperature,humidity,pressure,battery,rssi,timestamp`
- **Delimiter:** Comma (`,`) with CRLF line terminators.
- **Null Safety:** Missing readings output as empty string between delimiters (`,,`).

### 2.2 JSON Specification
- **MIME Type:** `application/json`
- **Root Element:** Array of serialized Telemetry Records with ISO 8601 UTC timestamps.

---

## 3. Memory Safety & Large Dataset Safeguards
- For datasets up to 10,000 points, client-side Blob generation consumes under 2MB RAM and completes in `< 15ms`.
- For multi-gigabyte industrial historical queries (> 100,000 readings), the interface delegates to backend streaming endpoint `GET /api/telemetry/export?format=csv&stream=true` using HTTP chunked transfer encoding.
