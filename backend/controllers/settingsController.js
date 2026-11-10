const store = require('../models/store');

exports.getSettings = (req, res) => {
  const settings = store.findOne('settings', (s) => s.id === 'global_settings') || {
    id: 'global_settings',
    appName: 'NexusFlow',
    appVersion: '1.0.0',
    internshipRef: 'ITS/WEB/1849',
    internName: 'Koneti Manikanth',
    company: 'Infotact Solutions',
    simulatorActive: true,
    simulatorInterval: 3000,
    audioAlerts: true,
    mqtt: {
      enabled: false,
      broker: 'mqtt://broker.emqx.io:1883',
      topicPrefix: 'nexusflow/telemetry/+',
      clientId: 'nexusflow_server_01',
    },
  };

  return res.json(settings);
};

exports.updateSettings = (req, res) => {
  const current = store.findOne('settings', (s) => s.id === 'global_settings');
  const updated = store.updateById('settings', current ? current.id : 'global_settings', req.body);

  store.insert('eventLogs', {
    category: 'SYSTEM',
    action: 'SETTINGS_UPDATED',
    message: 'System settings and configurations updated',
    level: 'info',
  });

  return res.json(updated);
};

exports.resetDemoData = (req, res) => {
  store.seedInitialData();
  return res.json({ success: true, message: 'Demo data reset to initial state successfully.' });
};

exports.getDiagnostics = (req, res) => {
  const memory = process.memoryUsage();
  return res.json({
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      rssMb: (memory.rss / (1024 * 1024)).toFixed(1),
      heapTotalMb: (memory.heapTotal / (1024 * 1024)).toFixed(1),
      heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(1),
    },
    counts: {
      devices: store.find('devices').length,
      rules: store.find('rules').length,
      alerts: store.find('alerts').length,
      telemetry: store.find('telemetry').length,
      eventLogs: store.find('eventLogs').length,
    },
    timestamp: new Date().toISOString(),
  });
};
