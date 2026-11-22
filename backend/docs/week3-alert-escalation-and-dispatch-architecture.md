# NexusFlow — Week 3: Alert Escalation & Multi-Tier Dispatch Architecture
**Author:** Koneti Manikanth (Backend Engineering Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Incident Escalation & Action Dispatch Chains

---

## 1. Executive Summary

In high-consequence IoT deployments (industrial refrigeration, automated factory assembly lines, substation power grids), an unacknowledged critical alert can result in catastrophic equipment destruction or personnel safety hazards. A simple threshold alert is insufficient if on-duty plant operators fail to acknowledge the incident within guaranteed SLA response windows.

Week 3 introduces the **NexusFlow Multi-Tier Alert Escalation Engine** (`backend/services/escalationService.js`), providing deterministic SLA timers, hierarchical notification advancement, and emergency failsafe action dispatching.

---

## 2. Multi-Tier Escalation Topology

```
+-----------------------------------------------------------------------------------------+
|                               Incident Escalation Chain                                 |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [ Threshold Breached ] (e.g. Turbine Temp > 85°C)                                      |
|            |                                                                            |
|            v                                                                            |
|  +-----------------------------------------------------------------------------------+  |
|  | LEVEL 1: Operator On-Call (Delay: 0 min)                                          |  |
|  | Channels: In-App Sound Banner, Real-Time WebSocket Toast                           |  |
|  +-----------------------------------------------------------------------------------+  |
|            |                                                                            |
|      [ Unacknowledged after 10 mins ]                                                   |
|            v                                                                            |
|  +-----------------------------------------------------------------------------------+  |
|  | LEVEL 2: Plant Supervisor Escalation (Delay: 10 mins)                              |  |
|  | Channels: Webhook to Ops Slack Channel, High-Priority Email Alert                  |  |
|  +-----------------------------------------------------------------------------------+  |
|            |                                                                            |
|      [ Unacknowledged after 30 mins ]                                                   |
|            v                                                                            |
|  +-----------------------------------------------------------------------------------+  |
|  | LEVEL 3: Incident Commander & SCADA Failsafe (Delay: 30 mins)                     |  |
|  | Channels: Emergency SMS Broadcast, MQTT Machine Cutoff Command                     |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Escalation Lifecycle & State Machine

```
              [ Alert Ingested ]
                      |
                      v
             +-----------------+
             |   ESCALATING    | <----+ (Timer Advance: Level 1 -> 2 -> 3)
             +-----------------+      |
                 |         |          |
 [Acknowledge]   |         | [Resolve]|
                 v         |          |
         +--------------+  |          |
         | ACKNOWLEDGED | -+----------+
         +--------------+  |
                 |         |
         [Resolve]         |
                 v         v
             +-----------------+
             |    RESOLVED     | ---> (Archive Duration & Delete from Active Map)
             +-----------------+
```

---

## 4. Policy Configuration Contract

```json
{
  "id": "policy_critical_standard",
  "name": "Critical Incident Rapid Escalation Chain",
  "severity": "critical",
  "levels": [
    {
      "level": 1,
      "delayMinutes": 0,
      "target": "operator_oncall",
      "channels": ["in_app", "websocket"]
    },
    {
      "level": 2,
      "delayMinutes": 10,
      "target": "plant_supervisor",
      "channels": ["webhook_slack", "email"]
    },
    {
      "level": 3,
      "delayMinutes": 30,
      "target": "incident_commander",
      "channels": ["emergency_sms", "mqtt_failsafe"]
    }
  ]
}
```

---

## 5. Automated Verification

The escalation service is validated by unit test suite [`backend/tests/escalationService.test.js`](file:///c:/NexusFlow/backend/tests/escalationService.test.js):
- ✅ Immediate Level 1 trigger with target routing
- ✅ Sequential level advancement through multi-tiered policy
- ✅ Enforcement of maximum escalation ceiling (`maxLevel`)
- ✅ Halting of auto-escalation upon operator acknowledgment
- ✅ Clean memory eviction and duration logging on resolution
- ✅ Active incident aggregations and breach counters

*Approved by:* Koneti Manikanth  
*Date:* November 2026
