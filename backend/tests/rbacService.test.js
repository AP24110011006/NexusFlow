/**
 * NexusFlow — RBAC & Permission Engine Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — Security Governance & Multi-Tier Authorization
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const { RbacService, ROLE_PERMISSIONS } = require('../services/rbacService');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('🧪 Starting NexusFlow RBAC & Permission Engine Tests...');

// 1. Admin wildcard access
test('Admin role possesses unrestricted wildcard permission for all operations', () => {
  const rbac = new RbacService();
  assert.strictEqual(rbac.hasPermission('admin', 'device:delete'), true);
  assert.strictEqual(rbac.hasPermission('admin', 'system:nuclear_reset'), true);
  assert.strictEqual(rbac.hasPermission('admin', 'rule:create'), true);
});

// 2. Operator permissions
test('Operator role can create rules and resolve alerts, but cannot configure system root', () => {
  const rbac = new RbacService();
  assert.strictEqual(rbac.hasPermission('operator', 'rule:create'), true);
  assert.strictEqual(rbac.hasPermission('operator', 'alert:resolve'), true);
  assert.strictEqual(rbac.hasPermission('operator', 'telemetry:ingest'), true);
  assert.strictEqual(rbac.hasPermission('operator', 'system:configure'), false);
  assert.strictEqual(rbac.hasPermission('operator', 'device:delete'), false);
});

// 3. Auditor permissions
test('Auditor role can read audit logs and export telemetry, but cannot modify rules', () => {
  const rbac = new RbacService();
  assert.strictEqual(rbac.hasPermission('auditor', 'audit:read'), true);
  assert.strictEqual(rbac.hasPermission('auditor', 'telemetry:export'), true);
  assert.strictEqual(rbac.hasPermission('auditor', 'rule:create'), false);
  assert.strictEqual(rbac.hasPermission('auditor', 'alert:acknowledge'), false);
});

// 4. Viewer read-only restrictions
test('Viewer role is strictly constrained to read operations and blocked from mutation', () => {
  const rbac = new RbacService();
  assert.strictEqual(rbac.hasPermission('viewer', 'telemetry:read'), true);
  assert.strictEqual(rbac.hasPermission('viewer', 'device:read'), true);
  assert.strictEqual(rbac.hasPermission('viewer', 'device:write'), false);
  assert.strictEqual(rbac.hasPermission('viewer', 'telemetry:ingest'), false);
  assert.strictEqual(rbac.hasPermission('viewer', 'alert:resolve'), false);
});

// 5. Dynamic role assignment
test('Dynamic role assignment changes user permissions dynamically', () => {
  const rbac = new RbacService();
  assert.strictEqual(rbac.getUserRole('usr_new_01'), 'viewer'); // default fallback
  rbac.assignRole('usr_new_01', 'operator');
  assert.strictEqual(rbac.getUserRole('usr_new_01'), 'operator');
  assert.strictEqual(rbac.hasPermission(rbac.getUserRole('usr_new_01'), 'rule:create'), true);
});

// 6. Permission middleware enforcement
test('Permission middleware invokes next() on authorized role and returns 403 on denied role', () => {
  const rbac = new RbacService();
  const middleware = rbac.requirePermission('rule:create');

  let nextCalled = false;
  const mockReq = { headers: { 'x-user-role': 'operator' } };
  const mockRes = {};
  middleware(mockReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Operator must pass rule:create');

  let statusCode = 0;
  let jsonOutput = null;
  const deniedReq = { headers: { 'x-user-role': 'viewer' } };
  const deniedRes = {
    status: (code) => { statusCode = code; return deniedRes; },
    json: (body) => { jsonOutput = body; return deniedRes; }
  };
  middleware(deniedReq, deniedRes, () => {});
  assert.strictEqual(statusCode, 403, 'Viewer must receive HTTP 403');
  assert.strictEqual(jsonOutput.error, 'Forbidden');
});

console.log('\n========================================');
console.log(`RBAC Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
