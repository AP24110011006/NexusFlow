/**
 * NexusFlow - Automated Backend System Health Check
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 1 Deliverable - Backend Infrastructure Verification
 * Organization: Infotact Solutions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(__dirname, '..', 'data');
const COLLECTIONS = [
  'users',
  'devices',
  'telemetry',
  'rules',
  'alerts',
  'eventLogs',
  'settings'
];

function runHealthCheck() {
  console.log('====================================================');
  console.log('NexusFlow — Backend Health & Integrity Diagnostics');
  console.log('Author: Koneti Manikanth (Ref. No.: ITS/WEB/1849)');
  console.log('Milestone: Week 1 Backend Architecture Verification');
  console.log('====================================================\n');

  let passed = true;

  // 1. Runtime Environment
  console.log('1. Runtime Environment:');
  console.log(`   • Node Version : ${process.version}`);
  console.log(`   • Platform     : ${os.platform()} (${os.arch()})`);
  console.log(`   • CPU Cores    : ${os.cpus().length}`);
  console.log(`   • Free Memory  : ${(os.freemem() / (1024 * 1024)).toFixed(0)} MB / ${(os.totalmem() / (1024 * 1024)).toFixed(0)} MB`);
  console.log(`   • Process RSS  : ${(process.memoryUsage().rss / (1024 * 1024)).toFixed(1)} MB`);
  console.log('   ✅ Runtime environment OK\n');

  // 2. Storage Directory & File Integrity
  console.log('2. File Storage Integrity:');
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`   ❌ FAIL: Data directory does not exist at ${DATA_DIR}`);
    passed = false;
  } else {
    console.log(`   ✅ Data directory exists: ${DATA_DIR}`);
    for (const col of COLLECTIONS) {
      const filePath = path.join(DATA_DIR, `${col}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️ WARNING: ${col}.json not found (will be auto-initialized on boot)`);
      } else {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(content);
          const count = Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
          console.log(`   ✅ ${col}.json : VALID JSON (${count} records)`);
        } catch (err) {
          console.error(`   ❌ FAIL: ${col}.json is corrupt: ${err.message}`);
          passed = false;
        }
      }
    }
  }
  console.log('');

  // 3. Rule Engine In-Memory Sanity Check
  console.log('3. Rule Engine Functional Verification:');
  try {
    const RuleEngine = require('../services/ruleEngine');
    const mockTelemetry = {
      deviceId: 'DEV-1001',
      temperature: 46.2,
      humidity: 45.0,
      pressure: 1013.2,
      timestamp: new Date().toISOString()
    };
    const testResult = RuleEngine.testRule(
      { metric: 'temperature', operator: '>', threshold: 40 },
      mockTelemetry
    );

    if (testResult.matched === true) {
      console.log('   ✅ Rule Engine condition evaluation (46.2 > 40) : MATCHED (Expected)');
    } else {
      console.error('   ❌ FAIL: Rule Engine failed to detect threshold breach');
      passed = false;
    }
  } catch (err) {
    console.error(`   ❌ FAIL: Rule Engine verification error: ${err.message}`);
    passed = false;
  }
  console.log('');

  // 4. Final Verdict
  console.log('====================================================');
  if (passed) {
    console.log('🎉 ALL HEALTH CHECKS PASSED — BACKEND SYSTEM READY');
  } else {
    console.error('💥 HEALTH CHECKS FAILED — INSPECT ERRORS ABOVE');
    process.exit(1);
  }
  console.log('====================================================\n');
}

if (require.main === module) {
  runHealthCheck();
}

module.exports = runHealthCheck;
