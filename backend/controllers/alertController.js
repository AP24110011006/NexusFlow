const alertService = require('../services/alertService');

exports.getAlerts = (req, res) => {
  try {
    const { status, severity, deviceId } = req.query;
    const alerts = alertService.getAlerts({ status, severity, deviceId });
    return res.json({ alerts, count: alerts.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAlertStats = (req, res) => {
  try {
    const stats = alertService.getAlertStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.acknowledgeAlert = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body.user || (req.user ? req.user.name : 'Operator');
    const updated = alertService.acknowledgeAlert(id, user);
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.resolveAlert = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body.user || (req.user ? req.user.name : 'Operator');
    const note = req.body.resolutionNote || 'Condition normalized';
    const updated = alertService.resolveAlert(id, user, note);
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.clearResolved = (req, res) => {
  try {
    const removedCount = alertService.clearResolvedAlerts();
    return res.json({ success: true, count: removedCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
