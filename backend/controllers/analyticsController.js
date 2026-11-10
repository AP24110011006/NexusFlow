const store = require('../models/store');

exports.getHistoricalTrends = (req, res) => {
  const { deviceId, range = '24h', metric = 'temperature' } = req.query;
  const now = Date.now();
  let timeWindowMs = 24 * 60 * 60 * 1000;

  if (range === '1h') timeWindowMs = 60 * 60 * 1000;
  else if (range === '6h') timeWindowMs = 6 * 60 * 60 * 1000;
  else if (range === '24h') timeWindowMs = 24 * 60 * 60 * 1000;
  else if (range === '7d') timeWindowMs = 7 * 24 * 60 * 60 * 1000;

  const cutoff = now - timeWindowMs;
  let records = store.find('telemetry', (t) => new Date(t.timestamp).getTime() >= cutoff);

  if (deviceId && deviceId !== 'all') {
    records = records.filter((t) => t.deviceId === deviceId);
  }

  // Sort ascending by time
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // If too many records, sample or bucket them
  const maxPoints = 120;
  let sampled = records;
  if (records.length > maxPoints) {
    const step = Math.ceil(records.length / maxPoints);
    sampled = records.filter((_, idx) => idx % step === 0);
  }

  const chartData = sampled.map((r) => ({
    timestamp: r.timestamp,
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    pressure: r.pressure,
    battery: r.battery,
    deviceId: r.deviceId,
  }));

  return res.json({
    range,
    metric,
    deviceId: deviceId || 'all',
    pointsCount: chartData.length,
    data: chartData,
  });
};

exports.getDeviceComparison = (req, res) => {
  const devices = store.find('devices');
  const result = devices.map((dev) => {
    const readings = store.find('telemetry', (t) => t.deviceId === dev.deviceId);
    const temps = readings.map((r) => r.temperature).filter((v) => v !== null && !isNaN(v));
    const hums = readings.map((r) => r.humidity).filter((v) => v !== null && !isNaN(v));
    const pres = readings.map((r) => r.pressure).filter((v) => v !== null && !isNaN(v));

    const avg = (arr) => (arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0);
    const max = (arr) => (arr.length ? Math.max(...arr) : 0);
    const min = (arr) => (arr.length ? Math.min(...arr) : 0);

    return {
      deviceId: dev.deviceId,
      name: dev.name,
      type: dev.type,
      location: dev.location,
      status: dev.status,
      readingsCount: readings.length,
      temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
      humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
      pressure: { avg: avg(pres), min: min(pres), max: max(pres) },
      battery: dev.battery || 100,
    };
  });

  return res.json({ comparison: result });
};

exports.getSensorStatistics = (req, res) => {
  const devices = store.find('devices');
  const stats = devices.map((dev) => {
    const readings = store.find('telemetry', (t) => t.deviceId === dev.deviceId);
    const temps = readings.map((r) => r.temperature).filter((v) => v !== null);

    const alertsCount = store.find('alerts', (a) => a.deviceId === dev.deviceId).length;

    let avg = 0;
    let min = 0;
    let max = 0;
    let stdDev = 0;

    if (temps.length > 0) {
      avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      min = Math.min(...temps);
      max = Math.max(...temps);
      const variance = temps.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / temps.length;
      stdDev = Math.sqrt(variance);
    }

    return {
      deviceId: dev.deviceId,
      name: dev.name,
      location: dev.location,
      totalReadings: readings.length,
      alertsCount,
      tempMin: parseFloat(min.toFixed(1)),
      tempMax: parseFloat(max.toFixed(1)),
      tempAvg: parseFloat(avg.toFixed(1)),
      tempStdDev: parseFloat(stdDev.toFixed(2)),
      healthScore: Math.max(40, 100 - alertsCount * 12 - (dev.status === 'warning' ? 20 : 0)),
    };
  });

  return res.json({ sensorStatistics: stats });
};
