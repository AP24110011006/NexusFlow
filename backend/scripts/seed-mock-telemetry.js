/**
 * NexusFlow - Historical Telemetry Seeding Utility
 * Milestone: Week 1 Deliverable - Backend Data Pipeline & Stress Testing
 * Author: Koneti Manikanth (Ref. No.: ITS/WEB/1849)
 * Organization: Infotact Solutions
 * Domain: Web Development / IoT Backend Engineering
 *
 * Description:
 * Generates synthetic multi-device historical time-series telemetry data with
 * controlled Gaussian noise and deliberate threshold breaches (anomalies)
 * for testing the NexusFlow real-time Rule Engine and Analytics charts.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TELEMETRY_FILE = path.join(DATA_DIR, 'telemetry.json');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.json');

const DEFAULT_DEVICES = [
  { id: 'DEV-1001', name: 'Main Server Room Alpha', location: 'Server Room 1', baseTemp: 24, baseHum: 45, basePress: 1013 },
  { id: 'DEV-1002', name: 'Factory Floor Line B', location: 'Assembly Line B', baseTemp: 32, baseHum: 55, basePress: 1010 },
  { id: 'DEV-1003', name: 'Cold Storage Vault 4', location: 'Cold Storage 4', baseTemp: 4, baseHum: 85, basePress: 1015 },
  { id: 'DEV-1004', name: 'Boiler Room Station 1', location: 'Boiler Room', baseTemp: 38, baseHum: 30, basePress: 1008 },
  { id: 'DEV-1005', name: 'HVAC Air Duct South', location: 'HVAC Zone 2', baseTemp: 21, baseHum: 48, basePress: 1012 }
];

function randomGaussian(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function generateTelemetryBatch(totalPoints = 120, anomalyRate = 0.08) {
  const records = [];
  const now = Date.now();
  const intervalMs = 60 * 1000; // 1 minute per record step backward

  let anomalyCount = 0;

  for (let i = 0; i < totalPoints; i++) {
    const device = DEFAULT_DEVICES[i % DEFAULT_DEVICES.length];
    const timestamp = new Date(now - (totalPoints - i) * intervalMs).toISOString();
    const isAnomaly = Math.random() < anomalyRate;

    let tempVariance = randomGaussian(0, 1.2);
    let humVariance = randomGaussian(0, 2.0);
    let pressVariance = randomGaussian(0, 0.8);

    if (isAnomaly) {
      anomalyCount++;
      // Inject high-temperature anomaly or extreme low humidity
      if (Math.random() > 0.5) {
        tempVariance += (Math.random() * 15 + 10); // +10 to +25 C spike
      } else {
        humVariance -= (Math.random() * 25 + 15); // sharp drop
      }
    }

    const temperature = parseFloat((device.baseTemp + tempVariance).toFixed(2));
    const humidity = parseFloat(Math.max(10, Math.min(99, (device.baseHum + humVariance))).toFixed(2));
    const pressure = parseFloat((device.basePress + pressVariance).toFixed(2));
    const battery = Math.max(15, Math.min(100, Math.round(98 - (i * 0.05))));
    const rssi = Math.round(randomGaussian(-65, 5));

    records.push({
      id: uuidv4(),
      deviceId: device.id,
      temperature,
      humidity,
      pressure,
      battery,
      rssi,
      timestamp,
      isSynthetic: true,
      anomalyFlag: isAnomaly
    });
  }

  return { records, anomalyCount };
}

function runSeeder() {
  console.log('====================================================');
  console.log('NexusFlow — Week 1 Telemetry Data Seeder');
  console.log('Author: Koneti Manikanth (Backend Lead)');
  console.log('Target: Infotact Solutions IoT Simulation Suite');
  console.log('====================================================');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let existing = [];
  if (fs.existsSync(TELEMETRY_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const { records, anomalyCount } = generateTelemetryBatch(120, 0.08);
  console.log(`\nGenerated ${records.length} synthetic telemetry readings.`);
  console.log(`Injected ${anomalyCount} deliberate threshold breaches for Rule Engine verification.`);

  const merged = [...existing, ...records];
  fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  console.log(`\nSuccessfully persisted ${merged.length} total records to:`);
  console.log(`--> ${TELEMETRY_FILE}`);
  console.log('\nSample Reading:');
  console.log(JSON.stringify(records[0], null, 2));
  console.log('====================================================\n');
}

if (require.main === module) {
  runSeeder();
}

module.exports = { generateTelemetryBatch, DEFAULT_DEVICES };
