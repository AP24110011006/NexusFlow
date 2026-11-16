/**
 * NexusFlow — Webhook Dispatcher Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — Automated Webhook Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const webhookService = require('../services/webhookService');

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

console.log('🧪 Starting NexusFlow Webhook Service Unit Tests...');

// 1. HMAC SHA-256 signature generation
test('Generate consistent HMAC SHA-256 cryptographic signature', () => {
  const secret = 'my-test-secret-key';
  const payload = JSON.stringify({ event: 'test', value: 42 });
  const sig1 = webhookService.generateSignature(payload, secret);
  const sig2 = webhookService.generateSignature(payload, secret);
  assert.strictEqual(sig1, sig2, 'Signatures for identical payloads must match');
  assert.strictEqual(sig1.length, 64, 'SHA-256 hex digest must be 64 characters long');
});

// 2. Alert payload formatting
test('Format alert payload with canonical JSON structure and metadata', () => {
  const mockAlert = {
    id: 'alt_9988',
    ruleName: 'Overheat Detection',
    deviceId: 'DEV-1001',
    metric: 'temperature',
    value: 48.5,
    threshold: 40,
    severity: 'critical',
    message: 'High temperature 48.5°C detected on DEV-1001',
  };
  const payload = webhookService.formatAlertPayload(mockAlert);
  assert.strictEqual(payload.event, 'alert:critical');
  assert.strictEqual(payload.data.value, 48.5);
  assert.strictEqual(payload.data.deviceId, 'DEV-1001');
  assert.ok(payload.timestamp, 'Timestamp must exist');
});

// 3. Webhook creation & listing
test('Register and list new webhook destination with auto-generated secret', () => {
  const hook = webhookService.createWebhook({
    name: 'PagerDuty Emergency Endpoint',
    url: 'https://events.pagerduty.com/v2/enqueue',
    events: ['alert:critical'],
  });
  assert.ok(hook.id.startsWith('wh_'));
  assert.strictEqual(hook.name, 'PagerDuty Emergency Endpoint');
  assert.ok(hook.secret, 'Secret must be automatically generated');
  const allHooks = webhookService.getWebhooks();
  assert.ok(allHooks.some((h) => h.id === hook.id));
});

// 4. Test Webhook utility
test('testWebhook produces valid test payload and security digest', () => {
  const res = webhookService.testWebhook('https://example.com/webhook', 'secret123');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.signature.length, 64);
});

// 5. Deletion of webhook
test('Delete existing webhook by ID', () => {
  const tempHook = webhookService.createWebhook({
    name: 'Temporary Hook',
    url: 'https://example.com/temp',
  });
  const deleted = webhookService.deleteWebhook(tempHook.id);
  assert.strictEqual(deleted, true);
  const allHooks = webhookService.getWebhooks();
  assert.strictEqual(allHooks.some((h) => h.id === tempHook.id), false);
});

// Summary
console.log('\n========================================');
console.log(`Webhook Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
