const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');

class AlertService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  getAlerts(filters = {}) {
    let alerts = store.find('alerts');

    if (filters.status && filters.status !== 'all') {
      alerts = alerts.filter((a) => a.status === filters.status);
    }
    if (filters.severity && filters.severity !== 'all') {
      alerts = alerts.filter((a) => a.severity === filters.severity);
    }
    if (filters.deviceId && filters.deviceId !== 'all') {
      alerts = alerts.filter((a) => a.deviceId === filters.deviceId);
    }

    // Sort newest first
    return alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAlertStats() {
    const alerts = store.find('alerts');
    const total = alerts.length;
    const active = alerts.filter((a) => a.status === 'active').length;
    const acknowledged = alerts.filter((a) => a.status === 'acknowledged').length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;
    const critical = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    const warning = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;

    return {
      total,
      active,
      acknowledged,
      resolved,
      critical,
      warning,
    };
  }

  createAlert({ rule, device, metric, value }) {
    // Generate human friendly message
    let message = rule.messageTemplate || `Threshold violation: ${metric} is ${value} (rule: ${rule.name})`;
    message = message
      .replace('{{value}}', value)
      .replace('{{threshold}}', rule.threshold)
      .replace('{{device}}', device ? `${device.name} (${device.deviceId})` : rule.deviceId)
      .replace('{{metric}}', metric);

    const alert = store.insert('alerts', {
      id: `alt_${uuidv4().substring(0, 8)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      deviceId: device ? device.deviceId : rule.deviceId,
      deviceName: device ? device.name : rule.deviceId,
      metric,
      value,
      threshold: rule.threshold,
      operator: rule.operator,
      severity: rule.severity || 'warning',
      message,
      status: 'active',
      acknowledgedAt: null,
      resolvedAt: null,
    });

    // Log the event
    store.insert('eventLogs', {
      category: 'ALERT',
      action: 'ALERT_TRIGGERED',
      message: `[${alert.severity.toUpperCase()}] ${alert.message}`,
      level: alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warn' : 'info',
      metadata: { alertId: alert.id, ruleId: rule.id, deviceId: alert.deviceId, value },
    });

    // Update device status if critical
    if (device && alert.severity === 'critical') {
      store.updateById('devices', device.id, { status: 'warning' });
    }

    // Emit live WebSocket event
    if (this.io) {
      this.io.emit('alert:new', alert);
      this.io.emit('stats:updated', this.getAlertStats());
    }

    return alert;
  }

  acknowledgeAlert(id, user = 'Operator') {
    const updated = store.updateById('alerts', id, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: user,
    });

    if (updated) {
      store.insert('eventLogs', {
        category: 'ALERT',
        action: 'ALERT_ACKNOWLEDGED',
        message: `Alert ${id} acknowledged by ${user}`,
        level: 'info',
        metadata: { alertId: id },
      });

      if (this.io) {
        this.io.emit('alert:updated', updated);
        this.io.emit('stats:updated', this.getAlertStats());
      }
    }
    return updated;
  }

  resolveAlert(id, user = 'Operator', resolutionNote = 'Condition normalized') {
    const updated = store.updateById('alerts', id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: user,
      resolutionNote,
    });

    if (updated) {
      store.insert('eventLogs', {
        category: 'ALERT',
        action: 'ALERT_RESOLVED',
        message: `Alert ${id} marked as RESOLVED (${resolutionNote})`,
        level: 'info',
        metadata: { alertId: id, resolutionNote },
      });

      if (this.io) {
        this.io.emit('alert:updated', updated);
        this.io.emit('stats:updated', this.getAlertStats());
      }
    }
    return updated;
  }

  clearResolvedAlerts() {
    const count = store.remove('alerts', (a) => a.status === 'resolved');
    store.insert('eventLogs', {
      category: 'ALERT',
      action: 'ALERTS_CLEARED',
      message: `Cleared ${count} resolved alerts from system`,
      level: 'info',
    });
    if (this.io) {
      this.io.emit('alerts:cleared');
      this.io.emit('stats:updated', this.getAlertStats());
    }
    return count;
  }
}

module.exports = new AlertService();
