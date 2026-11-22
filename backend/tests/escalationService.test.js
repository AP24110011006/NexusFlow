/**
 * NexusFlow — Alert Escalation Service Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — Escalation Chains & Failsafe Dispatch Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const { EscalationService } = require('../services/escalationService');

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

console.log('🧪 Starting NexusFlow Alert Escalation Service Tests...');

// 1. Initial trigger creates Level 1 escalation record
test('Initial alert trigger creates Level 1 escalation with policy targets', () => {
  const service = new EscalationService();
  const alert = { id: 'alt_001', deviceId: 'DEV-001', severity: 'critical' };

  const esc = service.triggerEscalation(alert);
  assert.strictEqual(esc.alertId, 'alt_001');
  assert.strictEqual(esc.currentLevel, 1);
  assert.strictEqual(esc.status, 'escalating');
  assert.strictEqual(esc.timeline.length, 1);
  assert.strictEqual(esc.timeline[0].target, 'operator_oncall');
});

// 2. Escalation advancement
test('Advances escalation chain sequentially through Level 2 and Level 3', () => {
  const service = new EscalationService();
  const alert = { id: 'alt_002', deviceId: 'DEV-002', severity: 'critical' };
  service.triggerEscalation(alert);

  const lvl2 = service.advanceEscalation('alt_002');
  assert.strictEqual(lvl2.currentLevel, 2);
  assert.strictEqual(lvl2.timeline[1].target, 'plant_supervisor');

  const lvl3 = service.advanceEscalation('alt_002');
  assert.strictEqual(lvl3.currentLevel, 3);
  assert.strictEqual(lvl3.timeline[2].target, 'incident_commander');
});

// 3. Max level barrier
test('Does not advance beyond configured maxLevel', () => {
  const service = new EscalationService();
  const alert = { id: 'alt_003', deviceId: 'DEV-003', severity: 'warning' }; // warning has 2 levels
  service.triggerEscalation(alert);
  service.advanceEscalation('alt_003'); // to level 2

  const over = service.advanceEscalation('alt_003'); // cannot go to level 3
  assert.strictEqual(over, null);
  assert.strictEqual(service.getEscalation('alt_003').currentLevel, 2);
});

// 4. Acknowledgment halts escalation
test('Operator acknowledgment halts automatic escalation progression', () => {
  const service = new EscalationService();
  const alert = { id: 'alt_004', deviceId: 'DEV-004', severity: 'critical' };
  service.triggerEscalation(alert);

  const ack = service.acknowledge('alt_004', 'operator_alice');
  assert.strictEqual(ack.status, 'acknowledged');
  assert.strictEqual(ack.acknowledgedBy, 'operator_alice');

  // Advancement should now be rejected
  const advancement = service.advanceEscalation('alt_004');
  assert.strictEqual(advancement, null);
});

// 5. Resolution cleans active map and logs duration
test('Alert resolution clears active map and archives resolution duration', () => {
  const service = new EscalationService();
  const alert = { id: 'alt_005', deviceId: 'DEV-005', severity: 'critical' };
  service.triggerEscalation(alert);

  const res = service.resolve('alt_005', 'lead_bob');
  assert.strictEqual(res.status, 'resolved');
  assert.strictEqual(service.getActiveEscalations().length, 0);
  assert.strictEqual(service.getEscalation('alt_005'), null);
});

// 6. Stats calculation
test('Accurately aggregates active escalations and level breaches', () => {
  const service = new EscalationService();
  service.triggerEscalation({ id: 'alt_c1', deviceId: 'DEV-1', severity: 'critical' });
  service.triggerEscalation({ id: 'alt_w1', deviceId: 'DEV-2', severity: 'warning' });
  service.triggerEscalation({ id: 'alt_c2', deviceId: 'DEV-3', severity: 'critical' });

  // Advance alt_c1 to level 3
  service.advanceEscalation('alt_c1');
  service.advanceEscalation('alt_c1');

  const stats = service.getStats();
  assert.strictEqual(stats.totalActive, 3);
  assert.strictEqual(stats.criticalCount, 2);
  assert.strictEqual(stats.warningCount, 1);
  assert.strictEqual(stats.levelThreeBreaches, 1);
});

console.log('\n========================================');
console.log(`Escalation Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
