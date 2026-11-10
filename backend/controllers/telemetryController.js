const telemetryService = require('../services/telemetryService');

exports.ingestTelemetry = (req, res) => {
  try {
    const result = telemetryService.ingest(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getTelemetry = (req, res) => {
  try {
    const { deviceId, startDate, endDate, limit } = req.query;
    const data = telemetryService.getTelemetry({ deviceId, startDate, endDate, limit });
    return res.json({ telemetry: data, count: data.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getDeviceTelemetry = (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit } = req.query;
    const data = telemetryService.getDeviceTelemetry(deviceId, limit ? parseInt(limit, 10) : 50);
    return res.json({ deviceId, telemetry: data, count: data.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getTelemetryStats = (req, res) => {
  try {
    const stats = telemetryService.getTelemetryStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
