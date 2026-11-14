# NexusFlow — User Personas & Industrial Operator Profiles
**Role:** Frontend Core & Layout Engineer  
**Contributor:** Likhitha (Frontend Lead)  
**Organization:** Infotact Solutions  
**Milestone:** Week 1 — User-Centered Design & Persona Specifications  

---

## 1. Persona 1: Rajesh Kumar — Industrial Plant Floor Supervisor

- **Age:** 38  
- **Location:** Electronic City, Bengaluru  
- **Role:** Factory Operations & Safety Supervisor  
- **Environment:** Multi-screen industrial control desk adjacent to factory assembly line.  
- **Primary Goals:**
  - Detect high temperature conditions in boiler stations before emergency shutoffs trip.
  - View overall status of 50+ sensors at a glance without reading raw logs.
  - Acknowledge alerts quickly and dispatch field technicians.
- **Pain Points:**
  - Previous legacy system required manual screen refreshing.
  - Alert fatigue caused by false alarms from oscillating temperature noise.
- **How NexusFlow Solves This:**
  - Real-time WebSocket streaming updates gauges within `< 50ms`.
  - Hysteresis debouncing in Rule Engine suppresses repeated false alarm triggers.

---

## 2. Persona 2: Priya Sundaram — IoT Reliability & Automation Engineer

- **Age:** 29  
- **Location:** Whitefield, Bengaluru  
- **Role:** IoT Solutions Architect & Firmware Engineer  
- **Environment:** Development workstation + field test benches.  
- **Primary Goals:**
  - Register new edge gateway devices (ESP32 / LoRaWAN nodes) with IP and MAC bindings.
  - Build automated condition rules (`Temp > 40°C`, `Battery < 20%`) via the UI sandbox.
  - Export historical telemetry data to CSV/JSON for sensor calibration.
- **Pain Points:**
  - Writing hardcoded backend code whenever a threshold changes.
  - Lack of immediate visual verification when testing new edge sensor hardware.
- **How NexusFlow Solves This:**
  - Visual Rule Builder in Module 4 (`/rules`) allows instant threshold changes.
  - In-memory testing sandbox lets engineers test mock payloads before deploying rules.

---

## 3. Persona 3: David Reynolds — Executive Facility Manager

- **Age:** 46  
- **Location:** Global Operations Headquarters  
- **Role:** Director of Corporate Facilities & Energy Compliance  
- **Primary Goals:**
  - Review weekly energy and thermal compliance trends.
  - Monitor uptime SLAs and hardware battery replacement timelines.
- **How NexusFlow Solves This:**
  - Executive Dashboard (`/`) displays high-level KPIs and multi-zone charts.
  - Visual Analytics Module (`/analytics`) enables multi-device time-series comparisons.
