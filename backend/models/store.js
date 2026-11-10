const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Ensure data directory exists
if (!fs.existsSync(config.dataPath)) {
  fs.mkdirSync(config.dataPath, { recursive: true });
}

class Store {
  constructor() {
    this.collections = [
      'users',
      'devices',
      'telemetry',
      'rules',
      'alerts',
      'eventLogs',
      'settings',
    ];
    this.data = {};
    this.init();
  }

  getFilePath(collection) {
    return path.join(config.dataPath, `${collection}.json`);
  }

  init() {
    for (const col of this.collections) {
      const filePath = this.getFilePath(col);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.data[col] = JSON.parse(raw);
        } catch (err) {
          console.error(`Error reading ${col}.json, initializing empty:`, err.message);
          this.data[col] = [];
        }
      } else {
        this.data[col] = [];
      }
    }

    // Seed defaults if empty
    if (!this.data.devices || this.data.devices.length === 0) {
      this.seedInitialData();
    }
  }

  save(collection) {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(this.data[collection] || [], null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving ${collection}:`, err.message);
    }
  }

  saveAll() {
    for (const col of this.collections) {
      this.save(col);
    }
  }

  // Generic CRUD helpers
  find(collection, filterFn) {
    const list = this.data[collection] || [];
    if (!filterFn) return [...list];
    return list.filter(filterFn);
  }

  findOne(collection, filterFn) {
    const list = this.data[collection] || [];
    return list.find(filterFn) || null;
  }

  findById(collection, id) {
    return this.findOne(collection, (item) => item.id === id || item._id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const record = {
      id: item.id || uuidv4(),
      createdAt: item.createdAt || new Date().toISOString(),
      ...item,
    };
    this.data[collection].push(record);

    // Limit telemetry history to last 2000 points to keep file lean and fast
    if (collection === 'telemetry' && this.data.telemetry.length > 2000) {
      this.data.telemetry = this.data.telemetry.slice(-2000);
    }
    // Limit event logs to last 1000 items
    if (collection === 'eventLogs' && this.data.eventLogs.length > 1000) {
      this.data.eventLogs = this.data.eventLogs.slice(-1000);
    }

    this.save(collection);
    return record;
  }

  update(collection, filterFn, updateObj) {
    const list = this.data[collection] || [];
    const index = list.findIndex(filterFn);
    if (index === -1) return null;

    const updated = {
      ...list[index],
      ...updateObj,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.save(collection);
    return updated;
  }

  updateById(collection, id, updateObj) {
    return this.update(collection, (item) => item.id === id || item._id === id, updateObj);
  }

  remove(collection, filterFn) {
    const list = this.data[collection] || [];
    const initialLen = list.length;
    this.data[collection] = list.filter((item) => !filterFn(item));
    const removedCount = initialLen - this.data[collection].length;
    if (removedCount > 0) {
      this.save(collection);
    }
    return removedCount;
  }

  removeById(collection, id) {
    return this.remove(collection, (item) => item.id === id || item._id === id);
  }

  // Pre-seed realistic data for demo & presentation
  seedInitialData() {
    console.log('⚡ Initializing NexusFlow with realistic IoT demo data...');

    // Users
    this.data.users = [
      {
        id: 'usr_manikanth',
        name: 'Koneti Manikanth',
        email: 'manikanth9878@gmail.com',
        role: 'Associate L1. Intern',
        department: 'Web Development',
        organization: 'Infotact Solutions',
        phone: '+91 7989612028',
        refNo: 'ITS/WEB/1849',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        createdAt: '2026-11-10T09:00:00.000Z',
      },
      {
        id: 'usr_admin',
        name: 'Nexus Admin',
        email: 'admin@nexusflow.io',
        role: 'System Administrator',
        department: 'Operations',
        organization: 'Infotact Solutions',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
        createdAt: '2026-11-10T08:00:00.000Z',
      },
    ];

    // Devices
    this.data.devices = [
      {
        id: 'dev_001',
        deviceId: 'SENSOR_001',
        name: 'Assembly Line Climate Probe',
        type: 'Environmental Sensor',
        location: 'Factory Floor - Room 101',
        status: 'online',
        ipAddress: '192.168.1.101',
        macAddress: '00:1A:2B:3C:4D:01',
        firmware: 'v2.4.1',
        battery: 92,
        reportingInterval: 3,
        lastReading: {
          temperature: 31.5,
          humidity: 48.2,
          pressure: 1012.8,
          battery: 92,
          timestamp: new Date().toISOString(),
        },
        lastSeen: new Date().toISOString(),
        telemetryCount: 140,
        createdAt: '2026-11-10T08:30:00.000Z',
      },
      {
        id: 'dev_002',
        deviceId: 'SENSOR_002',
        name: 'Server Room Climate Unit',
        type: 'HVAC Monitor',
        location: 'Data Center - Rack Bay B',
        status: 'online',
        ipAddress: '192.168.1.102',
        macAddress: '00:1A:2B:3C:4D:02',
        firmware: 'v2.4.1',
        battery: 98,
        reportingInterval: 3,
        lastReading: {
          temperature: 23.4,
          humidity: 41.0,
          pressure: 1014.1,
          battery: 98,
          timestamp: new Date().toISOString(),
        },
        lastSeen: new Date().toISOString(),
        telemetryCount: 135,
        createdAt: '2026-11-10T08:35:00.000Z',
      },
      {
        id: 'dev_003',
        deviceId: 'SENSOR_003',
        name: 'Steam Boiler High-Temp Sensor',
        type: 'Industrial Pressure & Temp',
        location: 'Power Unit 3 - Boiler Room',
        status: 'warning',
        ipAddress: '192.168.1.103',
        macAddress: '00:1A:2B:3C:4D:03',
        firmware: 'v3.1.0',
        battery: 84,
        reportingInterval: 3,
        lastReading: {
          temperature: 41.8,
          humidity: 29.1,
          pressure: 1032.5,
          battery: 84,
          timestamp: new Date().toISOString(),
        },
        lastSeen: new Date().toISOString(),
        telemetryCount: 152,
        createdAt: '2026-11-10T08:40:00.000Z',
      },
      {
        id: 'dev_004',
        deviceId: 'SENSOR_004',
        name: 'Cleanroom Environmental Probe',
        type: 'Precision Microclimate',
        location: 'Packaging Facility - ISO Class 7',
        status: 'online',
        ipAddress: '192.168.1.104',
        macAddress: '00:1A:2B:3C:4D:04',
        firmware: 'v2.2.0',
        battery: 76,
        reportingInterval: 5,
        lastReading: {
          temperature: 20.8,
          humidity: 44.5,
          pressure: 1015.0,
          battery: 76,
          timestamp: new Date().toISOString(),
        },
        lastSeen: new Date().toISOString(),
        telemetryCount: 110,
        createdAt: '2026-11-10T08:45:00.000Z',
      },
      {
        id: 'dev_005',
        deviceId: 'SENSOR_005',
        name: 'Cold Storage Deep Freezer',
        type: 'Cryo Logistics Probe',
        location: 'Warehouse Logistics - Bay 3',
        status: 'online',
        ipAddress: '192.168.1.105',
        macAddress: '00:1A:2B:3C:4D:05',
        firmware: 'v1.9.8',
        battery: 65,
        reportingInterval: 5,
        lastReading: {
          temperature: -18.2,
          humidity: 55.0,
          pressure: 1011.2,
          battery: 65,
          timestamp: new Date().toISOString(),
        },
        lastSeen: new Date().toISOString(),
        telemetryCount: 95,
        createdAt: '2026-11-10T08:50:00.000Z',
      },
    ];

    // Rules - matching the project specifications
    this.data.rules = [
      {
        id: 'rule_001',
        name: 'High Temperature Detection',
        description: 'Detects whenever ambient temperature exceeds safe operational limits (40°C)',
        deviceId: 'all',
        metric: 'temperature',
        operator: '>',
        threshold: 40,
        actionType: 'alert',
        severity: 'critical',
        messageTemplate: 'High temperature alert: {{value}}°C exceeds configured threshold {{threshold}}°C on {{device}}',
        enabled: true,
        cooldownSeconds: 20,
        lastTriggered: '2026-11-10T09:30:00.000Z',
        triggerCount: 3,
        createdAt: '2026-11-10T09:00:00.000Z',
      },
      {
        id: 'rule_002',
        name: 'Low Humidity Warning',
        description: 'Flags electrostatic discharge risk when humidity drops below 30%',
        deviceId: 'all',
        metric: 'humidity',
        operator: '<',
        threshold: 30,
        actionType: 'alert',
        severity: 'warning',
        messageTemplate: 'Low humidity detected: {{value}}% is below safe threshold {{threshold}}% on {{device}}',
        enabled: true,
        cooldownSeconds: 30,
        lastTriggered: '2026-11-10T09:15:00.000Z',
        triggerCount: 1,
        createdAt: '2026-11-10T09:05:00.000Z',
      },
      {
        id: 'rule_003',
        name: 'Steam Boiler Overpressure',
        description: 'Immediate alert when steam vessel pressure crosses 1028 hPa limit',
        deviceId: 'SENSOR_003',
        metric: 'pressure',
        operator: '>',
        threshold: 1028,
        actionType: 'alert',
        severity: 'critical',
        messageTemplate: 'Critical boiler overpressure: {{value}} hPa on {{device}}! Immediate ventilation required.',
        enabled: true,
        cooldownSeconds: 15,
        lastTriggered: '2026-11-10T09:40:00.000Z',
        triggerCount: 2,
        createdAt: '2026-11-10T09:10:00.000Z',
      },
      {
        id: 'rule_004',
        name: 'Low Battery Indicator',
        description: 'Notifies maintenance when wireless node battery falls below 20%',
        deviceId: 'all',
        metric: 'battery',
        operator: '<',
        threshold: 20,
        actionType: 'alert',
        severity: 'info',
        messageTemplate: 'Sensor battery low: {{value}}% remaining on {{device}}. Schedule battery replacement.',
        enabled: true,
        cooldownSeconds: 60,
        lastTriggered: null,
        triggerCount: 0,
        createdAt: '2026-11-10T09:15:00.000Z',
      },
    ];

    // Alerts
    this.data.alerts = [
      {
        id: 'alt_001',
        ruleId: 'rule_001',
        ruleName: 'High Temperature Detection',
        deviceId: 'SENSOR_003',
        deviceName: 'Steam Boiler High-Temp Sensor',
        metric: 'temperature',
        value: 41.8,
        threshold: 40,
        operator: '>',
        severity: 'critical',
        message: 'High temperature alert: 41.8°C exceeds configured threshold 40°C on Steam Boiler High-Temp Sensor (SENSOR_003)',
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acknowledgedAt: null,
        resolvedAt: null,
      },
      {
        id: 'alt_002',
        ruleId: 'rule_003',
        ruleName: 'Steam Boiler Overpressure',
        deviceId: 'SENSOR_003',
        deviceName: 'Steam Boiler High-Temp Sensor',
        metric: 'pressure',
        value: 1032.5,
        threshold: 1028,
        operator: '>',
        severity: 'critical',
        message: 'Critical boiler overpressure: 1032.5 hPa on Steam Boiler High-Temp Sensor! Immediate ventilation required.',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        resolvedAt: null,
      },
      {
        id: 'alt_003',
        ruleId: 'rule_002',
        ruleName: 'Low Humidity Warning',
        deviceId: 'SENSOR_003',
        deviceName: 'Steam Boiler High-Temp Sensor',
        metric: 'humidity',
        value: 29.1,
        threshold: 30,
        operator: '<',
        severity: 'warning',
        message: 'Low humidity detected: 29.1% is below safe threshold 30% on Steam Boiler High-Temp Sensor (SENSOR_003)',
        status: 'resolved',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ];

    // Seed Telemetry points for past 30 minutes to render rich analytics immediately
    this.data.telemetry = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000).toISOString();
      // SENSOR_001
      this.data.telemetry.push({
        id: uuidv4(),
        deviceId: 'SENSOR_001',
        temperature: parseFloat((28.5 + Math.sin(i / 5) * 3 + Math.random() * 0.8).toFixed(1)),
        humidity: parseFloat((48 + Math.cos(i / 6) * 5 + Math.random() * 0.5).toFixed(1)),
        pressure: parseFloat((1013 + Math.sin(i / 10) * 1.5).toFixed(1)),
        battery: 92,
        rssi: -65,
        timestamp: time,
      });
      // SENSOR_002
      this.data.telemetry.push({
        id: uuidv4(),
        deviceId: 'SENSOR_002',
        temperature: parseFloat((22.0 + Math.sin(i / 7) * 1.5 + Math.random() * 0.4).toFixed(1)),
        humidity: parseFloat((40 + Math.cos(i / 8) * 3 + Math.random() * 0.5).toFixed(1)),
        pressure: parseFloat((1014 + Math.sin(i / 10) * 1.2).toFixed(1)),
        battery: 98,
        rssi: -58,
        timestamp: time,
      });
      // SENSOR_003
      this.data.telemetry.push({
        id: uuidv4(),
        deviceId: 'SENSOR_003',
        temperature: parseFloat((39.0 + Math.sin(i / 4) * 4.2 + (i < 5 ? 2.5 : 0)).toFixed(1)),
        humidity: parseFloat((31.0 - (i < 5 ? 2.2 : 0) + Math.random() * 0.8).toFixed(1)),
        pressure: parseFloat((1027 + Math.sin(i / 5) * 4 + (i < 5 ? 3 : 0)).toFixed(1)),
        battery: 84,
        rssi: -72,
        timestamp: time,
      });
    }

    // Event Logs
    this.data.eventLogs = [
      {
        id: uuidv4(),
        category: 'SYSTEM',
        action: 'PLATFORM_INIT',
        message: 'NexusFlow IoT Engine initialized successfully on port 5000',
        level: 'info',
        timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        category: 'DEVICE',
        action: 'DEVICE_REGISTERED',
        message: 'Registered new device SENSOR_001 (Assembly Line Climate Probe)',
        level: 'info',
        metadata: { deviceId: 'SENSOR_001', location: 'Factory Floor' },
        timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        category: 'RULE_ENGINE',
        action: 'RULE_TRIGGERED',
        message: 'Rule "High Temperature Detection" evaluated to TRUE (41.8°C > 40°C)',
        level: 'warn',
        metadata: { ruleId: 'rule_001', deviceId: 'SENSOR_003', value: 41.8 },
        timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        category: 'ALERT',
        action: 'ALERT_GENERATED',
        message: 'Generated CRITICAL alert alt_001 for SENSOR_003',
        level: 'error',
        metadata: { alertId: 'alt_001', severity: 'critical' },
        timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
      },
    ];

    // Settings
    this.data.settings = [
      {
        id: 'global_settings',
        appName: 'NexusFlow',
        appVersion: '1.0.0',
        internshipRef: 'ITS/WEB/1849',
        internName: 'Koneti Manikanth',
        company: 'Infotact Solutions',
        simulatorActive: true,
        simulatorInterval: 3000,
        audioAlerts: true,
        autoResolveMinutes: 120,
        mqtt: {
          enabled: false,
          broker: 'mqtt://broker.emqx.io:1883',
          topicPrefix: 'nexusflow/telemetry/+',
          clientId: 'nexusflow_server_01',
        },
      },
    ];

    this.saveAll();
    console.log('✅ NexusFlow demo data seeded successfully!');
  }
}

// Singleton store instance
const store = new Store();
module.exports = store;
