const simulator = require('../simulators/iotSimulator');

exports.getStatus = (req, res) => {
  return res.json(simulator.getStatus());
};

exports.start = (req, res) => {
  const { intervalMs } = req.body;
  simulator.start(intervalMs ? parseInt(intervalMs, 10) : undefined);
  return res.json({ success: true, message: 'IoT Simulator started', status: simulator.getStatus() });
};

exports.stop = (req, res) => {
  simulator.stop();
  return res.json({ success: true, message: 'IoT Simulator stopped', status: simulator.getStatus() });
};

exports.injectAnomaly = (req, res) => {
  const { deviceId, metric, value } = req.body;
  try {
    const result = simulator.injectAnomaly({ deviceId, metric, value });
    return res.json({
      success: true,
      message: `Anomaly injected successfully: ${metric || 'temperature'}=${value || 46.5} on ${deviceId || 'SENSOR_001'}`,
      result,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
