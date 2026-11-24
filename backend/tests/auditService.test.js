/**
 * NexusFlow — Cryptographically Linked Audit Service Unit Tests
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — Audit Ledger & Tamper Verification Tests
 * Organization: Infotact Solutions
 */

const assert = require('assert');
const { AuditService } = require('../services/auditService');

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

console.log('🧪 Starting NexusFlow Audit Service Unit Tests...');

// 1. Genesis block initialization
test('Genesis block initializes with index 0 and cryptographically valid hash', () => {
  const audit = new AuditService();
  const integrity = audit.verifyLedgerIntegrity();
  assert.strictEqual(integrity.valid, true);
  assert.strictEqual(integrity.totalBlocks, 1);
});

// 2. Sequential block appending & prevHash linking
test('Appends sequential actions and establishes cryptographic prevHash link', () => {
  const audit = new AuditService();
  const b1 = audit.logAction({
    userId: 'usr_manikanth',
    userRole: 'admin',
    action: 'RULE_CREATED',
    resourceType: 'rule',
    resourceId: 'rule_temp_01',
    details: { threshold: 45 },
  });

  assert.strictEqual(b1.index, 1);
  assert.strictEqual(b1.prevHash, audit.ledger[0].hash);
  assert.strictEqual(typeof b1.hash, 'string');
  assert.strictEqual(b1.hash.length, 64);

  const b2 = audit.logAction({
    userId: 'usr_alice',
    userRole: 'operator',
    action: 'ALERT_ACKNOWLEDGED',
    resourceType: 'alert',
    resourceId: 'alt_99',
  });

  assert.strictEqual(b2.index, 2);
  assert.strictEqual(b2.prevHash, b1.hash);
});

// 3. Verification of pristine chain
test('verifyLedgerIntegrity returns valid: true for untampered multi-block ledger', () => {
  const audit = new AuditService();
  for (let i = 0; i < 5; i++) {
    audit.logAction({
      userId: `user_${i}`,
      action: 'DEVICE_PING',
      resourceId: `DEV-${i}`,
    });
  }

  const integrity = audit.verifyLedgerIntegrity();
  assert.strictEqual(integrity.valid, true);
  assert.strictEqual(integrity.totalBlocks, 6);
});

// 4. Content tampering detection
test('Detects malicious payload mutation and pinpoints compromised block index', () => {
  const audit = new AuditService();
  audit.logAction({ userId: 'alice', action: 'ACTION_1' });
  audit.logAction({ userId: 'bob', action: 'ACTION_2', details: { amount: 100 } });
  audit.logAction({ userId: 'charlie', action: 'ACTION_3' });

  // Tamper with block 2 details behind the scenes
  audit.ledger[2].details.amount = 999999;

  const check = audit.verifyLedgerIntegrity();
  assert.strictEqual(check.valid, false);
  assert.strictEqual(check.compromisedIndex, 2);
  assert.ok(check.reason.includes('Tampered content'));
});

// 5. Broken chain link detection
test('Detects broken prevHash linkage when records are deleted or substituted', () => {
  const audit = new AuditService();
  audit.logAction({ userId: 'u1', action: 'ACTION_1' });
  audit.logAction({ userId: 'u2', action: 'ACTION_2' });

  // Mutate prevHash of block 2
  audit.ledger[2].prevHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

  const check = audit.verifyLedgerIntegrity();
  assert.strictEqual(check.valid, false);
  assert.strictEqual(check.compromisedIndex, 2);
  assert.ok(check.reason.includes('Broken chain link'));
});

// 6. Query filtering
test('getAuditTrail filters records accurately by action and userId', () => {
  const audit = new AuditService();
  audit.logAction({ userId: 'operator_1', action: 'RULE_UPDATE', resourceType: 'rule' });
  audit.logAction({ userId: 'operator_2', action: 'ALERT_RESOLVE', resourceType: 'alert' });
  audit.logAction({ userId: 'operator_1', action: 'ALERT_RESOLVE', resourceType: 'alert' });

  const filterUser1 = audit.getAuditTrail({ userId: 'operator_1' });
  assert.strictEqual(filterUser1.length, 2);

  const filterAction = audit.getAuditTrail({ action: 'ALERT_RESOLVE' });
  assert.strictEqual(filterAction.length, 2);

  const filterBoth = audit.getAuditTrail({ userId: 'operator_1', action: 'ALERT_RESOLVE' });
  assert.strictEqual(filterBoth.length, 1);
  assert.strictEqual(filterBoth[0].resourceType, 'alert');
});

console.log('\n========================================');
console.log(`Audit Service Results: ${passedTests}/${totalTests} Tests Passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
