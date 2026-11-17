/**
 * NexusFlow — Circular Ring Buffer Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — Automated Buffer Verification
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const bufferService = require('../services/bufferService');
const { RingBuffer } = require('../services/bufferService');

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

console.log('🧪 Starting NexusFlow Circular Ring Buffer Tests...');

// 1. Basic RingBuffer insertion and size
test('RingBuffer appends items and reports accurate size', () => {
  const ring = new RingBuffer(5);
  assert.strictEqual(ring.size(), 0);
  ring.push({ val: 1 });
  ring.push({ val: 2 });
  assert.strictEqual(ring.size(), 2);
  const arr = ring.toArray();
  assert.strictEqual(arr.length, 2);
  assert.strictEqual(arr[0].val, 1);
  assert.strictEqual(arr[1].val, 2);
});

// 2. FIFO wrapping and eviction
test('RingBuffer wraps and evicts oldest items when capacity is reached', () => {
  const ring = new RingBuffer(3);
  ring.push({ val: 1 });
  ring.push({ val: 2 });
  assert.strictEqual(ring.isFull, false);
  ring.push({ val: 3 });
  assert.strictEqual(ring.isFull, true);
  assert.strictEqual(ring.size(), 3);

  // Push 4th item -> should evict { val: 1 } and place 4 at index 0
  ring.push({ val: 4 });
  assert.strictEqual(ring.isFull, true);
  assert.strictEqual(ring.size(), 3);

  const arr = ring.toArray();
  assert.strictEqual(arr.length, 3);
  assert.strictEqual(arr[0].val, 2);
  assert.strictEqual(arr[1].val, 3);
  assert.strictEqual(arr[2].val, 4);
});

// 3. getLatest slice query
test('getLatest returns the newest K items in chronological sequence', () => {
  const ring = new RingBuffer(5);
  for (let i = 1; i <= 5; i++) ring.push({ val: i });
  const latest2 = ring.getLatest(2);
  assert.strictEqual(latest2.length, 2);
  assert.strictEqual(latest2[0].val, 4);
  assert.strictEqual(latest2[1].val, 5);
});

// 4. Batch push into BufferService
test('BufferService accepts batch packets for specific device', () => {
  bufferService.clear('DEV-TEST-01');
  const batch = [{ temp: 20 }, { temp: 21 }, { temp: 22 }];
  const size = bufferService.pushBatch('DEV-TEST-01', batch);
  assert.strictEqual(size, 3);
  const items = bufferService.getAll('DEV-TEST-01');
  assert.strictEqual(items.length, 3);
  assert.strictEqual(items[2].temp, 22);
});

// 5. Multi-device isolation
test('BufferService isolates buffers between independent devices', () => {
  bufferService.clear();
  bufferService.push('DEV-A', { metric: 'A1' });
  bufferService.push('DEV-B', { metric: 'B1' });
  bufferService.push('DEV-B', { metric: 'B2' });

  assert.strictEqual(bufferService.size('DEV-A'), 1);
  assert.strictEqual(bufferService.size('DEV-B'), 2);
  const stats = bufferService.getStats();
  assert.strictEqual(stats.activeBuffers, 2);
  assert.strictEqual(stats.totalBufferedItems, 3);
});

// Summary
console.log('\n========================================');
console.log(`Buffer Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
