# NexusFlow — Week 3: Role-Based Access Control (RBAC) & Permission Matrix
**Author:** Koneti Manikanth (Backend Engineering Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Security Governance & Multi-Tier Authorization

---

## 1. Executive Summary

As industrial IoT installations scale across teams (site technicians, control room operators, safety auditors, and plant administrators), unrestrained API access introduces severe risks of accidental device deletion, rule tampering, or unauthorized telemetry exports.

Week 3 introduces the **NexusFlow Role-Based Access Control (RBAC) Engine** (`backend/services/rbacService.js`), enforcing multi-tier credential authorization, granular functional permissions, and Express endpoint protection middleware.

---

## 2. Role-to-Permission Matrix

| Functional Scope | Permission Key | Admin | Operator | Auditor | Viewer |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Device Inventory** | `device:read` | ✅ | ✅ | ✅ | ✅ |
| | `device:write` | ✅ | ✅ | ❌ | ❌ |
| | `device:delete` | ✅ | ❌ | ❌ | ❌ |
| **Telemetry Data** | `telemetry:read` | ✅ | ✅ | ✅ | ✅ |
| | `telemetry:ingest` | ✅ | ✅ | ❌ | ❌ |
| | `telemetry:export` | ✅ | ✅ | ✅ | ❌ |
| **Rule Engine** | `rule:read` | ✅ | ✅ | ✅ | ✅ |
| | `rule:create` | ✅ | ✅ | ❌ | ❌ |
| | `rule:update` | ✅ | ✅ | ❌ | ❌ |
| | `rule:execute` | ✅ | ✅ | ❌ | ❌ |
| **Alert & Escalation**| `alert:read` | ✅ | ✅ | ✅ | ✅ |
| | `alert:acknowledge` | ✅ | ✅ | ❌ | ❌ |
| | `alert:resolve` | ✅ | ✅ | ❌ | ❌ |
| | `escalation:resolve`| ✅ | ✅ | ❌ | ❌ |
| **Webhooks & Sinks** | `webhook:read` | ✅ | ✅ | ✅ | ❌ |
| | `webhook:test` | ✅ | ✅ | ❌ | ❌ |
| | `webhook:create` | ✅ | ❌ | ❌ | ❌ |
| **Audit & Governance**| `log:read` | ✅ | ✅ | ✅ | ❌ |
| | `audit:read` | ✅ | ❌ | ✅ | ❌ |
| | `system:configure` | ✅ | ❌ | ❌ | ❌ |

---

## 3. Middleware Architecture

NexusFlow exposes two declarative middleware generators for securing HTTP routes:

```javascript
// 1. Enforce specific permission
router.post('/api/rules', rbacService.requirePermission('rule:create'), ruleController.createRule);

// 2. Enforce minimum role membership
router.post('/api/settings', rbacService.requireRole(['admin']), settingsController.updateSettings);
```

When an unauthorized client makes a request, the engine returns HTTP 403 Forbidden with diagnostic metadata:

```json
{
  "error": "Forbidden",
  "message": "Access denied. Role 'viewer' lacks required permission: 'rule:create'.",
  "requiredPermission": "rule:create",
  "userRole": "viewer"
}
```

---

## 4. Automated Verification

Validated by unit test suite [`backend/tests/rbacService.test.js`](file:///c:/NexusFlow/backend/tests/rbacService.test.js):
- ✅ Wildcard permission resolution for administrators
- ✅ Separation of operator operational rights from root administrative rights
- ✅ Compliance auditing read/export permissions without mutation access
- ✅ Strict read-only enforcement for viewer profiles
- ✅ Dynamic user-role reassignment
- ✅ Express middleware interception and 403 response verification

*Approved by:* Koneti Manikanth  
*Date:* November 2026
