/**
 * NexusFlow — Dead Letter Queue (DLQ) Service Unit Tests
 * Author: Koneti Manikanth (Backend Lead & Architect)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Fault Tolerance & DLQ Verification
 */

const assert = require('assert');
const { DeadLetterQueueService } = require('../services/dlqService');

console.log('🧪 Starting NexusFlow Dead Letter Queue (DLQ) Service Unit Tests...\n');

let testsPassed = 0;
const totalTests = 6;

async function runTest(description, testFn) {
  try {
    await testFn();
    console.log(`  ✅ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  const service = new DeadLetterQueueService({
    maxCapacity: 5,
    maxRetries: 3,
    baseBackoffMs: 100,
    maxBackoffMs: 5000
  });

  // Test 1: Enqueue message with pending_retry status
  await runTest('Enqueues failed telemetry/webhook message with accurate metadata and pending_retry status', () => {
    service.clear();
    const payload = { deviceId: 'SEN-VIB-01', acceleration: 4.8 };
    const error = new Error('HTTP 504 Gateway Timeout');
    error.code = 'TIMEOUT';

    const entry = service.enqueue(payload, error, { destination: 'pagerduty_webhook' });

    assert.ok(entry.id.startsWith('dlq_'));
    assert.strictEqual(entry.destination, 'pagerduty_webhook');
    assert.strictEqual(entry.attempts, 0);
    assert.strictEqual(entry.status, 'pending_retry');
    assert.strictEqual(entry.error.code, 'TIMEOUT');
    assert.ok(entry.nextRetryAt !== null);
  });

  // Test 2: Exponential backoff calculation
  await runTest('Calculates exponential backoff with jitter and sets nextRetryAt properly', () => {
    const backoff0 = service.calculateBackoff(0);
    const backoff1 = service.calculateBackoff(1);
    const backoff2 = service.calculateBackoff(2);

    assert.ok(backoff0 >= 100 && backoff0 <= 150, `Backoff 0 (${backoff0}) out of range`);
    assert.ok(backoff1 >= 200 && backoff1 <= 300, `Backoff 1 (${backoff1}) out of range`);
    assert.ok(backoff2 >= 400 && backoff2 <= 600, `Backoff 2 (${backoff2}) out of range`);
  });

  // Test 3: Successful replay transitions status to resolved
  await runTest('Replays message successfully via handler and transitions status to resolved', async () => {
    service.clear();
    const entry = service.enqueue({ alertId: 'ALT-99' }, new Error('Network reset'));

    let handled = false;
    const mockHandler = async (payload) => {
      assert.strictEqual(payload.alertId, 'ALT-99');
      handled = true;
      return { dispatched: true };
    };

    const result = await service.replayMessage(entry.id, mockHandler);

    assert.strictEqual(result.success, true);
    assert.strictEqual(handled, true);
    const updated = service.getMessage(entry.id);
    assert.strictEqual(updated.status, 'resolved');
    assert.ok(updated.resolvedAt !== null);
    assert.strictEqual(updated.nextRetryAt, null);
  });

  // Test 4: Poisoned status when maxRetries exceeded
  await runTest('Transitions message to poisoned state when maxRetries threshold is breached', async () => {
    service.clear();
    const entry = service.enqueue({ metric: 'pressure' }, new Error('Connection refused'), { maxRetries: 2 });

    const failingHandler = async () => {
      throw new Error('Destination permanently unreachable');
    };

    // Attempt 1
    await service.replayMessage(entry.id, failingHandler);
    let state = service.getMessage(entry.id);
    assert.strictEqual(state.attempts, 1);
    assert.strictEqual(state.status, 'pending_retry');

    // Attempt 2 (Breaches maxRetries = 2)
    await service.replayMessage(entry.id, failingHandler);
    state = service.getMessage(entry.id);
    assert.strictEqual(state.attempts, 2);
    assert.strictEqual(state.status, 'poisoned');
    assert.strictEqual(state.nextRetryAt, null);
  });

  // Test 5: FIFO capacity eviction
  await runTest('Respects FIFO capacity eviction when queue exceeds maximum buffer limit', () => {
    service.clear();
    // Service has maxCapacity = 5
    const ids = [];
    for (let i = 1; i <= 6; i++) {
      const entry = service.enqueue({ seq: i }, new Error(`Error ${i}`));
      ids.push(entry.id);
    }

    // First item should have been evicted
    assert.strictEqual(service.getMessage(ids[0]), null);
    // Subsequent 5 items should exist
    for (let i = 1; i < 6; i++) {
      assert.ok(service.getMessage(ids[i]) !== null);
    }
    const metrics = service.getMetrics();
    assert.strictEqual(metrics.totalDropped, 1);
    assert.strictEqual(metrics.activeQueueSize, 5);
  });

  // Test 6: Aggregates metrics accurately
  await runTest('Returns accurate aggregation metrics (pending, poisoned, resolved, total)', async () => {
    service.clear();
    service.enqueue({ id: 'msg1' }, new Error('err'), { id: 'msg1' });
    const entry2 = service.enqueue({ id: 'msg2' }, new Error('err'), { id: 'msg2' });
    service.enqueue({ id: 'msg3' }, new Error('err'), { id: 'msg3', attempts: 3, maxRetries: 3 });

    // Resolve msg2
    await service.replayMessage(entry2.id, async () => ({ ok: true }));

    const metrics = service.getMetrics();
    assert.strictEqual(metrics.activeQueueSize, 3);
    assert.strictEqual(metrics.pendingCount, 1);
    assert.strictEqual(metrics.resolvedCount, 1);
    assert.strictEqual(metrics.poisonedCount, 1);
    assert.strictEqual(metrics.totalEnqueued, 3);
    assert.strictEqual(metrics.totalReplayed, 1);
  });

  console.log(`\n========================================`);
  console.log(`DLQ Service Results: ${testsPassed}/${totalTests} Tests Passed`);
  console.log(`========================================\n`);

  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
