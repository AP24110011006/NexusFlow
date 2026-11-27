/**
 * NexusFlow — Alert Silencing & Maintenance Window Unit Tests
 * Author: Koneti Manikanth (Backend Lead & Architect)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Alert Fatigue Suppression & Maintenance Windows
 */

const assert = require('assert');
const { AlertSilenceService } = require('../services/silenceService');

console.log('🧪 Starting NexusFlow Alert Silencing Service Unit Tests...\n');

let testsPassed = 0;
const totalTests = 6;

function runTest(description, testFn) {
  try {
    testFn();
    console.log(`  ✅ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

const service = new AlertSilenceService();

// Test 1: Creates active silence rule with future expiration timestamp and unique ID
runTest('Creates active silence rule with future expiration timestamp and unique ID', () => {
  service.clear();
  const silence = service.createSilence({
    matchers: { deviceId: 'SEN-TEMP-01', metric: 'temperature' },
    durationMs: 3600000,
    reason: 'Scheduled thermal recalibration batch #41',
    createdBy: 'manikanth'
  });

  assert.ok(silence.id.startsWith('sil_'));
  assert.strictEqual(silence.status, 'active');
  assert.strictEqual(silence.matchers.deviceId, 'SEN-TEMP-01');
  assert.strictEqual(silence.createdBy, 'manikanth');
  assert.ok(silence.endTimestamp > silence.startTimestamp);
});

// Test 2: Suppresses alerts matching explicit deviceId, metric, or severity during active window
runTest('Suppresses alerts matching explicit deviceId, metric, or severity during active window', () => {
  service.clear();
  service.createSilence({
    matchers: { deviceId: 'SEN-TEMP-01', severity: 'critical' },
    durationMs: 600000,
    reason: 'Planned boiler overhaul',
    createdBy: 'operator_1'
  });

  const matchingAlert = { deviceId: 'SEN-TEMP-01', severity: 'critical', value: 92.4 };
  const nonMatchingAlert = { deviceId: 'SEN-TEMP-01', severity: 'warning', value: 71.0 };
  const otherDeviceAlert = { deviceId: 'SEN-VIB-02', severity: 'critical', value: 5.1 };

  const res1 = service.shouldSilence(matchingAlert);
  const res2 = service.shouldSilence(nonMatchingAlert);
  const res3 = service.shouldSilence(otherDeviceAlert);

  assert.strictEqual(res1.silenced, true);
  assert.strictEqual(res1.reason, 'Planned boiler overhaul');
  assert.strictEqual(res2.silenced, false);
  assert.strictEqual(res3.silenced, false);
});

// Test 3: Does not suppress alerts after expiration timestamp has passed
runTest('Does not suppress alerts after expiration timestamp has passed', () => {
  service.clear();
  const now = 1700000000000;
  service.createSilence({
    matchers: { deviceId: 'PUMP-01' },
    startTime: now - 3600000,
    endTime: now - 60000, // Expired 1 minute ago
    reason: 'Past maintenance',
    createdBy: 'technician'
  });

  const alert = { deviceId: 'PUMP-01', metric: 'pressure' };
  const res = service.shouldSilence(alert, now);

  assert.strictEqual(res.silenced, false);
});

// Test 4: Matches wildcard ('*') and regex patterns across alert device/message fields
runTest("Matches wildcard ('*') and regex patterns across alert device/message fields", () => {
  service.clear();
  // Wildcard severity, regex device
  service.createSilence({
    matchers: { deviceId: '/^BLOWER-[0-9]+$/', severity: '*' },
    durationMs: 1800000,
    reason: 'Plant blower ventilation upgrade',
    createdBy: 'eng_lead'
  });

  const alert1 = { deviceId: 'BLOWER-04', severity: 'critical' };
  const alert2 = { deviceId: 'BLOWER-12', severity: 'info' };
  const alert3 = { deviceId: 'PUMP-04', severity: 'critical' };

  assert.strictEqual(service.shouldSilence(alert1).silenced, true);
  assert.strictEqual(service.shouldSilence(alert2).silenced, true);
  assert.strictEqual(service.shouldSilence(alert3).silenced, false);
});

// Test 5: Manual cancellation immediately deactivates silence rule
runTest('Manual cancellation immediately deactivates silence rule', () => {
  service.clear();
  const silence = service.createSilence({
    matchers: { deviceId: 'SEN-ACCEL-03' },
    durationMs: 7200000,
    reason: 'Testing sensor drift',
    createdBy: 'qa_agent'
  });

  const alert = { deviceId: 'SEN-ACCEL-03' };
  assert.strictEqual(service.shouldSilence(alert).silenced, true);

  const cancelResult = service.cancelSilence(silence.id);
  assert.strictEqual(cancelResult.success, true);
  assert.strictEqual(cancelResult.status, 'cancelled');

  // Next check should no longer silence
  assert.strictEqual(service.shouldSilence(alert).silenced, false);
});

// Test 6: Correctly tracks metrics (activeSilences, totalSuppressed, expiredSilences)
runTest('Correctly tracks metrics (activeSilences, totalSuppressed, expiredSilences)', () => {
  service.clear();
  const now = Date.now();

  service.createSilence({
    matchers: { deviceId: 'DEV-A' },
    startTime: now - 1000,
    endTime: now + 50000,
    reason: 'Rule A'
  });
  service.createSilence({
    matchers: { deviceId: 'DEV-B' },
    startTime: now - 50000,
    endTime: now - 1000, // Expired
    reason: 'Rule B'
  });

  // Evaluate DEV-A 3 times to increment totalSuppressed
  service.shouldSilence({ deviceId: 'DEV-A' }, now);
  service.shouldSilence({ deviceId: 'DEV-A' }, now);
  service.shouldSilence({ deviceId: 'DEV-A' }, now);

  // Evaluate DEV-B to trigger expiration
  service.shouldSilence({ deviceId: 'DEV-B' }, now);

  const metrics = service.getMetrics(now);
  assert.strictEqual(metrics.totalCreated, 2);
  assert.strictEqual(metrics.totalSuppressed, 3);
  assert.strictEqual(metrics.activeSilences, 1);
  assert.strictEqual(metrics.expiredSilences, 1);
});

console.log(`\n========================================`);
console.log(`Silence Service Results: ${testsPassed}/${totalTests} Tests Passed`);
console.log(`========================================\n`);

if (testsPassed !== totalTests) {
  process.exit(1);
}
