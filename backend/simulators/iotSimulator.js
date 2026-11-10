const telemetryService = require('../services/telemetryService');
const store = require('../models/store');
const config = require('../config/config');

class IoTSimulator {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.intervalMs = config.simulator.intervalMs || 3000;
    this.step = 0;
    this.io = null;

    // Device baselines for realistic environmental variation
    this.baselines = {
      SENSOR_001: { temp: 28.5, hum: 48.0, pres: 1013.2, tempAmp: 2.5, humAmp: 4.0 },
      SENSOR_002: { temp: 22.0, hum: 42.0, pres: 1014.0, tempAmp: 1.2, humAmp: 2.5 },
      SENSOR_003: { temp: 37.5, hum: 33.0, pres: 1024.0, tempAmp: 3.5, humAmp: 3.0 },
      SENSOR_004: { temp: 20.5, hum: 45.0, pres: 1015.5, tempAmp: 0.8, humAmp: 1.5 },
      SENSOR_005: { temp: -18.0, hum: 55.0, pres: 1011.0, tempAmp: 1.5, humAmp: 2.0 },
    };
  }

  setSocketIO(io) {
    this.io = io;
  }

  start(intervalMs) {
    if (intervalMs) this.intervalMs = intervalMs;
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(`📡 IoT Simulator started (interval: ${this.intervalMs}ms)`);

    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);

    if (this.io) {
      this.io.emit('simulator:status', { isRunning: true, intervalMs: this.intervalMs });
    }
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    console.log('🛑 IoT Simulator stopped');

    if (this.io) {
      this.io.emit('simulator:status', { isRunning: false, intervalMs: this.intervalMs });
    }
  }

  tick() {
    this.step += 1;
    const devices = store.find('devices', (d) => d.status !== 'offline');

    devices.forEach((device, index) => {
      const base = this.baselines[device.deviceId] || {
        temp: 25.0,
        hum: 50.0,
        pres: 1013.0,
        tempAmp: 2.0,
        humAmp: 3.0,
      };

      // Periodic oscillation with sine wave + small stochastic jitter
      const t = this.step + index * 4;
      const noiseT = (Math.random() - 0.5) * 0.6;
      const noiseH = (Math.random() - 0.5) * 1.0;
      const noiseP = (Math.random() - 0.5) * 0.4;

      const temperature = parseFloat((base.temp + Math.sin(t / 8) * base.tempAmp + noiseT).toFixed(1));
      const humidity = parseFloat(
        Math.max(10, Math.min(95, base.hum + Math.cos(t / 7) * base.humAmp + noiseH)).toFixed(1)
      );
      const pressure = parseFloat((base.pres + Math.sin(t / 12) * 1.5 + noiseP).toFixed(1));

      // Battery slow degradation or random wobble
      const battery = Math.max(15, (device.battery || 90) - (Math.random() > 0.98 ? 1 : 0));
      const rssi = Math.round(-60 - Math.random() * 15);

      try {
        telemetryService.ingest({
          deviceId: device.deviceId,
          temperature,
          humidity,
          pressure,
          battery,
          rssi,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Simulator error for ${device.deviceId}:`, err.message);
      }
    });
  }

  /**
   * Inject anomaly to instantly trigger rules & alerts during demo
   */
  injectAnomaly({ deviceId, metric, value }) {
    const targetDeviceId = deviceId || 'SENSOR_001';
    const targetMetric = metric || 'temperature';
    const targetValue = value !== undefined ? Number(value) : 46.5;

    const base = this.baselines[targetDeviceId] || { temp: 25, hum: 50, pres: 1013 };

    const payload = {
      deviceId: targetDeviceId,
      temperature: targetMetric === 'temperature' ? targetValue : base.temp,
      humidity: targetMetric === 'humidity' ? targetValue : base.hum,
      pressure: targetMetric === 'pressure' ? targetValue : base.pres,
      battery: targetMetric === 'battery' ? targetValue : 88,
      rssi: -58,
      timestamp: new Date().toISOString(),
    };

    console.log(`🚨 Injecting ANOMALY for ${targetDeviceId}: ${targetMetric}=${targetValue}`);

    store.insert('eventLogs', {
      category: 'SYSTEM',
      action: 'ANOMALY_INJECTED',
      message: `Manual anomaly injected for ${targetDeviceId}: ${targetMetric} = ${targetValue}`,
      level: 'warn',
      metadata: { targetDeviceId, targetMetric, targetValue },
    });

    return telemetryService.ingest(payload);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      simulatedDevicesCount: store.find('devices').length,
    };
  }
}

module.exports = new IoTSimulator();
