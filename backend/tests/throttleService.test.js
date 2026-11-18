/**
 * NexusFlow — Sliding-Window Rate Limiter & Throttle Service Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — Automated Rate Limiter Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const { ThrottleService } = require('../services/throttleService');

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

console.log('🧪 Starting NexusFlow Rate Limiter & Throttle Service Tests...');

// 1. Allows requests within configured max limit
test('Allows requests within quota and accurately decrements remaining tokens', () => {
  const limiter = new ThrottleService({ maxRequests: 3, windowMs: 10000 });
  const r1 = limiter.consume('DEV-001');
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r1.remaining, 2);
  assert.strictEqual(r1.limit, 3);

  const r2 = limiter.consume('DEV-001');
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r2.remaining, 1);

  const r3 = limiter.consume('DEV-001');
  assert.strictEqual(r3.allowed, true);
  assert.strictEqual(r3.remaining, 0);
});

// 2. Rejects request when limit is exceeded
test('Blocks requests exceeding the limit and reports positive retryAfterMs', () => {
  const limiter = new ThrottleService({ maxRequests: 2, windowMs: 5000 });
  limiter.consume('DEV-002');
  limiter.consume('DEV-002');

  const blocked = limiter.consume('DEV-002');
  assert.strictEqual(blocked.allowed, false);
  assert.strictEqual(blocked.remaining, 0);
  assert.ok(blocked.retryAfterMs > 0, 'retryAfterMs should be greater than 0');
  assert.ok(blocked.resetAt > Date.now(), 'resetAt should be in the future');
});

// 3. Device isolation: quota on one device does not affect another
test('Isolates rate limits between distinct device keys', () => {
  const limiter = new ThrottleService({ maxRequests: 1, windowMs: 5000 });
  const devA = limiter.consume('DEV-A');
  assert.strictEqual(devA.allowed, true);

  const devABlocked = limiter.consume('DEV-A');
  assert.strictEqual(devABlocked.allowed, false);

  const devB = limiter.consume('DEV-B');
  assert.strictEqual(devB.allowed, true, 'Device B must not be throttled by Device A usage');
});

// 4. Custom device override takes precedence over defaults
test('Custom device override provides tailored throughput allowance', () => {
  const limiter = new ThrottleService({ maxRequests: 2, windowMs: 5000 });
  // Elevate DEV-VIP to 10 req/window
  limiter.setDeviceOverride('DEV-VIP', 10, 5000);

  for (let i = 0; i < 5; i++) {
    const res = limiter.consume('DEV-VIP');
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.limit, 10);
  }

  const usage = limiter.getUsage('DEV-VIP');
  assert.strictEqual(usage.count, 5);
  assert.strictEqual(usage.remaining, 5);
});

// 5. Reset restores full quota immediately
test('Manual reset restores complete quota immediately', () => {
  const limiter = new ThrottleService({ maxRequests: 2, windowMs: 5000 });
  limiter.consume('DEV-003');
  limiter.consume('DEV-003');
  assert.strictEqual(limiter.consume('DEV-003').allowed, false);

  limiter.reset('DEV-003');
  const fresh = limiter.consume('DEV-003');
  assert.strictEqual(fresh.allowed, true);
  assert.strictEqual(fresh.remaining, 1);
});

console.log('\n========================================');
console.log(`Throttle Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
