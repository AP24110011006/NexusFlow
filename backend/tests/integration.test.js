/**
 * NexusFlow — End-to-End Ingestion, Rule Evaluation & Alert Lifecycle Integration Test
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 1 Deliverable — Ingestion Pipeline End-to-End Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const telemetryService = require('../services/telemetryService');
const alertService = require('../services/alertService');
const store = require('../models/store');

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

console.log('🧪 Starting NexusFlow End-to-End Integration Tests...');

// Setup: Ensure a high-temperature test rule exists
const existingRule = store.findOne('rules', (r) => r.metric === 'temperature' && r.threshold === 40);
if (!existingRule) {
  store.insert('rules', {
    name: 'Integration Test Overheat Rule',
    deviceId: 'DEV-1001',
    metric: 'temperature',
    operator: '>',
    threshold: 40,
    severity: 'critical',
    action: 'Generate high-temperature alert',
    enabled: true,
  });
}

// 1. Normal telemetry does not trigger overheat alert
test('Normal telemetry (32°C) ingests cleanly without triggering overheat alert', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 32.0,
    humidity: 48.0,
    pressure: 1012.0,
    battery: 92,
  };
  const result = telemetryService.ingest(payload);
  assert.ok(result.success, 'Ingestion should succeed');
  assert.strictEqual(result.triggeredAlerts.length, 0, 'No alerts should trigger for 32°C');
});

// 2. High temperature triggers rule and generates alert
test('Critical telemetry (47.5°C) ingests and triggers critical overheat alert', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 47.5,
    humidity: 35.0,
    pressure: 1011.0,
    battery: 90,
  };
  const result = telemetryService.ingest(payload);
  assert.ok(result.success, 'Ingestion should succeed');
  assert.ok(result.triggeredAlerts.length > 0, 'Alert should be triggered');
  const alertId = result.triggeredAlerts[0];
  const alert = store.findById('alerts', alertId);
  assert.ok(alert, 'Alert must exist in database');
  assert.strictEqual(alert.severity, 'critical', 'Alert severity should be critical');
  assert.strictEqual(alert.status, 'active', 'Alert status must initially be active');
});

// 3. Alert lifecycle: acknowledge and resolve
test('Operator can acknowledge and resolve triggered alert', () => {
  const activeAlerts = alertService.getAlerts({ status: 'active' });
  assert.ok(activeAlerts.length > 0, 'Must have at least one active alert');
  const target = activeAlerts[0];

  // Acknowledge
  const ack = alertService.acknowledgeAlert(target.id, 'admin');
  assert.strictEqual(ack.status, 'acknowledged');

  // Resolve
  const res = alertService.resolveAlert(target.id, 'admin');
  assert.strictEqual(res.status, 'resolved');
  assert.ok(res.resolvedAt, 'Resolved timestamp must be recorded');
});

// Summary
console.log('\n========================================');
console.log(`Integration Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
