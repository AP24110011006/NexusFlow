const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');
const ruleEngine = require('../services/ruleEngine');

exports.getAllRules = (req, res) => {
  const { enabled, metric, deviceId } = req.query;
  let rules = store.find('rules');

  if (enabled !== undefined) {
    const isEnabled = enabled === 'true';
    rules = rules.filter((r) => r.enabled === isEnabled);
  }
  if (metric && metric !== 'all') {
    rules = rules.filter((r) => r.metric === metric);
  }
  if (deviceId && deviceId !== 'all') {
    rules = rules.filter((r) => r.deviceId === deviceId || r.deviceId === 'all');
  }

  return res.json({ rules, total: rules.length });
};

exports.getRuleById = (req, res) => {
  const { id } = req.params;
  const rule = store.findById('rules', id);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  return res.json(rule);
};

exports.createRule = (req, res) => {
  const {
    name,
    description,
    deviceId = 'all',
    metric,
    operator,
    threshold,
    actionType = 'alert',
    severity = 'warning',
    messageTemplate,
    cooldownSeconds = 30,
    enabled = true,
  } = req.body;

  if (!name || !metric || !operator || threshold === undefined) {
    return res.status(400).json({ error: 'name, metric, operator, and threshold are required' });
  }

  const validOperators = ['>', '<', '>=', '<=', '==', '!='];
  if (!validOperators.includes(operator)) {
    return res.status(400).json({ error: `Invalid operator. Must be one of: ${validOperators.join(', ')}` });
  }

  const rule = store.insert('rules', {
    id: `rule_${uuidv4().substring(0, 8)}`,
    name,
    description: description || `Detects when ${metric} ${operator} ${threshold}`,
    deviceId,
    metric: metric.toLowerCase(),
    operator,
    threshold: Number(threshold),
    actionType,
    severity,
    messageTemplate: messageTemplate || `Alert: {{metric}} ({{value}}) ${operator} {{threshold}} on {{device}}`,
    cooldownSeconds: parseInt(cooldownSeconds, 10),
    enabled: Boolean(enabled),
    lastTriggered: null,
    triggerCount: 0,
  });

  store.insert('eventLogs', {
    category: 'RULE_ENGINE',
    action: 'RULE_CREATED',
    message: `Created rule "${rule.name}": ${rule.metric} ${rule.operator} ${rule.threshold}`,
    level: 'info',
    metadata: { ruleId: rule.id },
  });

  return res.status(201).json(rule);
};

exports.updateRule = (req, res) => {
  const { id } = req.params;
  const target = store.findById('rules', id);
  if (!target) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  const {
    name,
    description,
    deviceId,
    metric,
    operator,
    threshold,
    actionType,
    severity,
    messageTemplate,
    cooldownSeconds,
    enabled,
  } = req.body;

  const updated = store.updateById('rules', id, {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(deviceId !== undefined && { deviceId }),
    ...(metric !== undefined && { metric: metric.toLowerCase() }),
    ...(operator !== undefined && { operator }),
    ...(threshold !== undefined && { threshold: Number(threshold) }),
    ...(actionType !== undefined && { actionType }),
    ...(severity !== undefined && { severity }),
    ...(messageTemplate !== undefined && { messageTemplate }),
    ...(cooldownSeconds !== undefined && { cooldownSeconds: parseInt(cooldownSeconds, 10) }),
    ...(enabled !== undefined && { enabled: Boolean(enabled) }),
  });

  store.insert('eventLogs', {
    category: 'RULE_ENGINE',
    action: 'RULE_UPDATED',
    message: `Updated rule configuration: ${updated.name}`,
    level: 'info',
    metadata: { ruleId: id },
  });

  return res.json(updated);
};

exports.deleteRule = (req, res) => {
  const { id } = req.params;
  const target = store.findById('rules', id);
  if (!target) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  store.removeById('rules', id);

  store.insert('eventLogs', {
    category: 'RULE_ENGINE',
    action: 'RULE_DELETED',
    message: `Deleted rule: ${target.name}`,
    level: 'warn',
    metadata: { ruleId: id },
  });

  return res.json({ success: true, message: `Rule ${id} deleted` });
};

exports.toggleRule = (req, res) => {
  const { id } = req.params;
  const target = store.findById('rules', id);
  if (!target) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  const updated = store.updateById('rules', id, { enabled: !target.enabled });

  store.insert('eventLogs', {
    category: 'RULE_ENGINE',
    action: 'RULE_TOGGLED',
    message: `Rule "${target.name}" is now ${updated.enabled ? 'ENABLED' : 'DISABLED'}`,
    level: 'info',
    metadata: { ruleId: id, enabled: updated.enabled },
  });

  return res.json(updated);
};

exports.testRule = (req, res) => {
  const { rule, sampleTelemetry } = req.body;
  if (!rule || !sampleTelemetry) {
    return res.status(400).json({ error: 'Both rule and sampleTelemetry are required for testing' });
  }

  const result = ruleEngine.testRule(rule, sampleTelemetry);
  return res.json(result);
};
