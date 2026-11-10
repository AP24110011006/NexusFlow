const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');

exports.getAllDevices = (req, res) => {
  const { status, search, type } = req.query;
  let devices = store.find('devices');

  if (status && status !== 'all') {
    devices = devices.filter((d) => d.status === status);
  }

  if (type && type !== 'all') {
    devices = devices.filter((d) => d.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    devices = devices.filter(
      (d) =>
        d.deviceId.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q))
    );
  }

  // Calculate summary counts
  const total = store.find('devices').length;
  const online = store.find('devices', (d) => d.status === 'online').length;
  const warning = store.find('devices', (d) => d.status === 'warning').length;
  const offline = store.find('devices', (d) => d.status === 'offline').length;

  return res.json({
    devices,
    counts: { total, online, warning, offline },
  });
};

exports.getDeviceById = (req, res) => {
  const { id } = req.params;
  const device = store.findOne('devices', (d) => d.id === id || d.deviceId === id);

  if (!device) {
    return res.status(404).json({ error: `Device not found: ${id}` });
  }

  // Fetch recent telemetry for this device
  const telemetry = store
    .find('telemetry', (t) => t.deviceId === device.deviceId)
    .slice(-30);

  // Fetch active alerts for this device
  const alerts = store.find('alerts', (a) => a.deviceId === device.deviceId && a.status !== 'resolved');

  return res.json({
    device,
    recentTelemetry: telemetry,
    activeAlerts: alerts,
  });
};

exports.createDevice = (req, res) => {
  const { deviceId, name, type, location, ipAddress, reportingInterval } = req.body;

  if (!deviceId || !name) {
    return res.status(400).json({ error: 'deviceId and name are required' });
  }

  // Check if deviceId already exists
  const existing = store.findOne('devices', (d) => d.deviceId.toUpperCase() === deviceId.toUpperCase());
  if (existing) {
    return res.status(409).json({ error: `Device ID '${deviceId}' already exists.` });
  }

  const device = store.insert('devices', {
    deviceId: deviceId.toUpperCase(),
    name,
    type: type || 'Environmental Sensor',
    location: location || 'General Area',
    status: 'online',
    ipAddress: ipAddress || `192.168.1.${Math.floor(Math.random() * 150) + 100}`,
    macAddress: `00:1A:2B:3C:4D:${Math.floor(Math.random() * 89 + 10)}`,
    firmware: 'v2.4.0',
    battery: 100,
    reportingInterval: parseInt(reportingInterval || '3', 10),
    lastReading: null,
    lastSeen: new Date().toISOString(),
    telemetryCount: 0,
  });

  store.insert('eventLogs', {
    category: 'DEVICE',
    action: 'DEVICE_REGISTERED',
    message: `Registered new device: ${device.name} (${device.deviceId}) at ${device.location}`,
    level: 'info',
    metadata: { deviceId: device.deviceId, name: device.name },
  });

  return res.status(201).json(device);
};

exports.updateDevice = (req, res) => {
  const { id } = req.params;
  const { name, type, location, status, reportingInterval } = req.body;

  const target = store.findOne('devices', (d) => d.id === id || d.deviceId === id);
  if (!target) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const updated = store.updateById('devices', target.id, {
    ...(name && { name }),
    ...(type && { type }),
    ...(location && { location }),
    ...(status && { status }),
    ...(reportingInterval && { reportingInterval: parseInt(reportingInterval, 10) }),
  });

  store.insert('eventLogs', {
    category: 'DEVICE',
    action: 'DEVICE_UPDATED',
    message: `Updated device metadata for ${target.deviceId}`,
    level: 'info',
    metadata: { deviceId: target.deviceId },
  });

  return res.json(updated);
};

exports.deleteDevice = (req, res) => {
  const { id } = req.params;
  const target = store.findOne('devices', (d) => d.id === id || d.deviceId === id);

  if (!target) {
    return res.status(404).json({ error: 'Device not found' });
  }

  store.removeById('devices', target.id);

  store.insert('eventLogs', {
    category: 'DEVICE',
    action: 'DEVICE_DELETED',
    message: `Removed device ${target.name} (${target.deviceId})`,
    level: 'warn',
    metadata: { deviceId: target.deviceId },
  });

  return res.json({ success: true, message: `Device ${target.deviceId} deleted successfully` });
};

exports.toggleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const target = store.findOne('devices', (d) => d.id === id || d.deviceId === id);
  if (!target) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const newStatus = status || (target.status === 'offline' ? 'online' : 'offline');
  const updated = store.updateById('devices', target.id, { status: newStatus });

  store.insert('eventLogs', {
    category: 'DEVICE',
    action: 'STATUS_CHANGED',
    message: `Device ${target.deviceId} status changed to ${newStatus.toUpperCase()}`,
    level: newStatus === 'offline' ? 'warn' : 'info',
    metadata: { deviceId: target.deviceId, status: newStatus },
  });

  return res.json(updated);
};
