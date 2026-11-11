/**
 * NexusFlow Rule Engine Automated Unit Test Suite
 * Authored by: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Week 1 Deliverable — Logic Validation & Predicate Testing
 */

const assert = require('assert');
const ruleEngine = require('../services/ruleEngine');

console.log('🧪 Starting NexusFlow Rule Engine Unit Tests...\n');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
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

// 1. Operator Predicate Evaluation Tests
it('Operator > should return true when value exceeds threshold', () => {
  const result = ruleEngine.evaluateCondition(45.5, '>', 40.0);
  assert.strictEqual(result, true);
});

it('Operator > should return false when value is below threshold', () => {
  const result = ruleEngine.evaluateCondition(38.2, '>', 40.0);
  assert.strictEqual(result, false);
});

it('Operator < should evaluate low humidity condition correctly', () => {
  assert.strictEqual(ruleEngine.evaluateCondition(24.5, '<', 30.0), true);
  assert.strictEqual(ruleEngine.evaluateCondition(32.1, '<', 30.0), false);
});

it('Operator >= should return true at boundary equality and above', () => {
  assert.strictEqual(ruleEngine.evaluateCondition(40.0, '>=', 40.0), true);
  assert.strictEqual(ruleEngine.evaluateCondition(41.0, '>=', 40.0), true);
  assert.strictEqual(ruleEngine.evaluateCondition(39.9, '>=', 40.0), false);
});

it('Operator <= should return true at boundary equality and below', () => {
  assert.strictEqual(ruleEngine.evaluateCondition(20.0, '<=', 20.0), true);
  assert.strictEqual(ruleEngine.evaluateCondition(18.5, '<=', 20.0), true);
  assert.strictEqual(ruleEngine.evaluateCondition(20.1, '<=', 20.0), false);
});

it('Operator == should strictly match equal numeric or string conditions', () => {
  assert.strictEqual(ruleEngine.evaluateCondition(100, '==', 100), true);
  assert.strictEqual(ruleEngine.evaluateCondition(100, '==', 99), false);
});

it('Operator != should detect mismatch', () => {
  assert.strictEqual(ruleEngine.evaluateCondition(50, '!=', 40), true);
  assert.strictEqual(ruleEngine.evaluateCondition(50, '!=', 50), false);
});

// 2. Interactive Sandbox Tester Tests
it('testRule() sandbox method returns accurate explanation & matched flag', () => {
  const mockRule = { metric: 'temperature', operator: '>', threshold: 40 };
  const evaluation = ruleEngine.testRule(mockRule, { temperature: 46.5 });
  assert.strictEqual(evaluation.matched, true);
  assert.strictEqual(evaluation.value, 46.5);
  assert.ok(evaluation.reason.includes('Condition SATISFIED'));
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests}/${totalTests} Tests Passed`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
