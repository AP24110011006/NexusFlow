/**
 * Automated Telemetry Validation & Sanitization Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 1 Deliverable — Ingestion Pipeline Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const telemetryService = require('../services/telemetryService');

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

console.log('🧪 Starting NexusFlow Telemetry Validation Tests...');

// 1. Missing Device ID
test('Reject payload missing deviceId with descriptive error', () => {
  assert.throws(
    () => {
      telemetryService.ingest({ temperature: 25.4 });
    },
    /Telemetry payload must contain a valid deviceId/
  );
});

// 2. Null or undefined payload
test('Reject null or undefined payload', () => {
  assert.throws(
    () => {
      telemetryService.ingest(null);
    },
    /Telemetry payload must contain a valid deviceId/
  );
});

// 3. Normalization of floating point metrics
test('Properly parse and round floating point metrics to 2 decimal places', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 24.5678,
    humidity: 50.1234,
    pressure: 1013.8899,
  };
  const result = telemetryService.ingest(payload);
  assert.strictEqual(result.data.temperature, 24.57);
  assert.strictEqual(result.data.humidity, 50.12);
  assert.strictEqual(result.data.pressure, 1013.89);
});

// 4. Default values for battery and RSSI
test('Assign realistic defaults for battery (100) and RSSI (-60) if omitted', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 28.0,
  };
  const result = telemetryService.ingest(payload);
  assert.strictEqual(result.data.battery, 100);
  assert.strictEqual(result.data.rssi, -60);
});

// 5. Explicit battery and RSSI parsing
test('Correctly record explicit battery and RSSI readings', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 30.0,
    battery: 84.6,
    rssi: -72.2,
  };
  const result = telemetryService.ingest(payload);
  assert.strictEqual(result.data.battery, 85);
  assert.strictEqual(result.data.rssi, -72);
});

// 6. Canonical ISO 8601 timestamp generation
test('Generate valid ISO 8601 timestamp if none provided', () => {
  const payload = {
    deviceId: 'DEV-1001',
    temperature: 22.0,
  };
  const result = telemetryService.ingest(payload);
  assert.ok(result.data.timestamp);
  assert.ok(!isNaN(Date.parse(result.data.timestamp)));
});

// Summary
console.log('\n========================================');
console.log(`Test Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
