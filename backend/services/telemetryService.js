const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');
const ruleEngine = require('./ruleEngine');

class TelemetryService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Core telemetry ingestion handler
   */
  ingest(payload) {
    if (!payload || !payload.deviceId) {
      throw new Error('Telemetry payload must contain a valid deviceId');
    }

    const {
      deviceId,
      temperature,
      humidity,
      pressure,
      battery = 100,
      rssi = -60,
      timestamp = new Date().toISOString(),
    } = payload;

    // Parse and sanitize numeric metrics
    const telemetryRecord = {
      id: uuidv4(),
      deviceId,
      temperature: temperature !== undefined ? parseFloat(Number(temperature).toFixed(2)) : null,
      humidity: humidity !== undefined ? parseFloat(Number(humidity).toFixed(2)) : null,
      pressure: pressure !== undefined ? parseFloat(Number(pressure).toFixed(2)) : null,
      battery: battery !== undefined ? Math.round(Number(battery)) : 100,
      rssi: rssi !== undefined ? Math.round(Number(rssi)) : -60,
      timestamp: new Date(timestamp).toISOString(),
    };

    // Store reading
    const saved = store.insert('telemetry', telemetryRecord);

    // Update associated device state
    const device = store.findOne('devices', (d) => d.deviceId === deviceId);
    if (device) {
      store.updateById('devices', device.id, {
        status: device.status === 'offline' ? 'online' : device.status,
        battery: telemetryRecord.battery,
        lastReading: {
          temperature: telemetryRecord.temperature,
          humidity: telemetryRecord.humidity,
          pressure: telemetryRecord.pressure,
          battery: telemetryRecord.battery,
          timestamp: telemetryRecord.timestamp,
        },
        lastSeen: telemetryRecord.timestamp,
        telemetryCount: (device.telemetryCount || 0) + 1,
      });
    }

    // Pass reading through the Rule Engine
    const ruleEngineResults = ruleEngine.evaluateTelemetry(saved);

    // Broadcast live telemetry point to all connected WebSockets
    if (this.io) {
      this.io.emit('telemetry:new', saved);
    }

    return {
      success: true,
      data: saved,
      rulesEvaluated: ruleEngineResults.length,
      triggeredAlerts: ruleEngineResults.map((r) => r.alert.id),
    };
  }

  /**
   * Retrieve recent telemetry with filtering
   */
  getTelemetry(filters = {}) {
    let list = store.find('telemetry');

    if (filters.deviceId && filters.deviceId !== 'all') {
      list = list.filter((t) => t.deviceId === filters.deviceId);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() <= end);
    }

    // Default sorting: newest first
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const limit = parseInt(filters.limit || '100', 10);
    return list.slice(0, limit);
  }

  /**
   * Get device specific telemetry history ordered chronologically
   */
  getDeviceTelemetry(deviceId, limit = 50) {
    const list = store.find('telemetry', (t) => t.deviceId === deviceId);
    return list
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  /**
   * Summary KPI statistics
   */
  getTelemetryStats() {
    const all = store.find('telemetry');
    const devices = store.find('devices');
    const totalCount = all.length;

    // Calculate averages across last 100 points
    const recent = all.slice(-100);
    let avgTemp = 0;
    let avgHum = 0;
    let avgPressure = 0;

    if (recent.length > 0) {
      const validTemps = recent.filter((r) => r.temperature !== null);
      const validHums = recent.filter((r) => r.humidity !== null);
      const validPres = recent.filter((r) => r.pressure !== null);

      if (validTemps.length) avgTemp = validTemps.reduce((s, r) => s + r.temperature, 0) / validTemps.length;
      if (validHums.length) avgHum = validHums.reduce((s, r) => s + r.humidity, 0) / validHums.length;
      if (validPres.length) avgPressure = validPres.reduce((s, r) => s + r.pressure, 0) / validPres.length;
    }

    return {
      totalDataPoints: totalCount,
      activeDevices: devices.filter((d) => d.status === 'online').length,
      totalDevices: devices.length,
      averageTemperature: parseFloat(avgTemp.toFixed(1)),
      averageHumidity: parseFloat(avgHum.toFixed(1)),
      averagePressure: parseFloat(avgPressure.toFixed(1)),
    };
  }
}

module.exports = new TelemetryService();
