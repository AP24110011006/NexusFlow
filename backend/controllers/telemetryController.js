const telemetryService = require('../services/telemetryService');
const bufferService = require('../services/bufferService');

exports.ingestTelemetry = (req, res) => {
  try {
    const result = telemetryService.ingest(req.body);
    if (req.body && req.body.deviceId) {
      bufferService.push(req.body.deviceId, result.telemetry || result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.ingestBatchTelemetry = (req, res) => {
  try {
    const packets = Array.isArray(req.body) ? req.body : req.body.records || [];
    if (!Array.isArray(packets) || packets.length === 0) {
      return res.status(400).json({ error: 'Payload must contain a non-empty array of telemetry records' });
    }

    const results = [];
    const errors = [];

    packets.forEach((packet, idx) => {
      try {
        const ingested = telemetryService.ingest(packet);
        if (packet.deviceId) {
          bufferService.push(packet.deviceId, ingested.telemetry || ingested);
        }
        results.push(ingested);
      } catch (err) {
        errors.push({ index: idx, deviceId: packet.deviceId, error: err.message });
      }
    });

    return res.status(201).json({
      message: `Batch processed: ${results.length} succeeded, ${errors.length} failed`,
      total: packets.length,
      ingested: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
