const store = require('../models/store');
const alertService = require('./alertService');

class RuleEngine {
  constructor() {
    this.io = null;
    // Map to track last trigger timestamp per rule+device to enforce cooldown
    // key: `${ruleId}_${deviceId}` -> timestamp
    this.cooldownMap = new Map();
  }

  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Compare a telemetry value against rule threshold using rule operator
   */
  evaluateCondition(value, operator, threshold) {
    if (value === undefined || value === null) return false;
    const numValue = Number(value);
    const numThreshold = Number(threshold);

    if (isNaN(numValue) || isNaN(numThreshold)) {
      // String comparison fallback
      switch (operator) {
        case '==': return String(value) === String(threshold);
        case '!=': return String(value) !== String(threshold);
        default: return false;
      }
    }

    switch (operator) {
      case '>':  return numValue > numThreshold;
      case '<':  return numValue < numThreshold;
      case '>=': return numValue >= numThreshold;
      case '<=': return numValue <= numThreshold;
      case '==': return numValue === numThreshold;
      case '!=': return numValue !== numThreshold;
      default:   return false;
    }
  }

  /**
   * Main evaluation pipeline triggered whenever new telemetry arrives
   */
  evaluateTelemetry(telemetry) {
    if (!telemetry || !telemetry.deviceId) return [];

    const device = store.findOne('devices', (d) => d.deviceId === telemetry.deviceId);
    const enabledRules = store.find('rules', (r) => r.enabled);
    const triggeredRules = [];

    for (const rule of enabledRules) {
      // Check device target: matches if rule targets 'all' or specific deviceId
      if (rule.deviceId !== 'all' && rule.deviceId !== telemetry.deviceId) {
        continue;
      }

      // Extract telemetry metric value
      const metric = rule.metric ? rule.metric.toLowerCase() : null;
      if (!metric || telemetry[metric] === undefined) {
        continue;
      }

      const value = telemetry[metric];
      const isMatch = this.evaluateCondition(value, rule.operator, rule.threshold);

      if (isMatch) {
        // Check cooldown
        const cooldownKey = `${rule.id}_${telemetry.deviceId}`;
        const lastTrigger = this.cooldownMap.get(cooldownKey) || 0;
        const cooldownSeconds = rule.cooldownSeconds !== undefined ? rule.cooldownSeconds : 30;
        const elapsed = (Date.now() - lastTrigger) / 1000;

        if (elapsed < cooldownSeconds) {
          // Still in cooldown period - suppress duplicate alert
          continue;
        }

        // Update cooldown record
        this.cooldownMap.set(cooldownKey, Date.now());

        // Update rule statistics in store
        const currentCount = (rule.triggerCount || 0) + 1;
        store.updateById('rules', rule.id, {
          lastTriggered: new Date().toISOString(),
          triggerCount: currentCount,
        });

        // Trigger Alert
        const alert = alertService.createAlert({
          rule,
          device,
          metric,
          value,
        });

        // Record rule execution log
        store.insert('eventLogs', {
          category: 'RULE_ENGINE',
          action: 'RULE_FIRED',
          message: `Rule "${rule.name}" triggered for ${telemetry.deviceId}: ${metric} (${value}) ${rule.operator} ${rule.threshold}`,
          level: 'warn',
          metadata: {
            ruleId: rule.id,
            ruleName: rule.name,
            deviceId: telemetry.deviceId,
            metric,
            value,
            threshold: rule.threshold,
            operator: rule.operator,
          },
        });

        triggeredRules.push({
          rule,
          alert,
          metric,
          value,
        });

        // Broadcast rule evaluated event via Socket
        if (this.io) {
          this.io.emit('rule:evaluated', {
            ruleId: rule.id,
            ruleName: rule.name,
            deviceId: telemetry.deviceId,
            matched: true,
            value,
            threshold: rule.threshold,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return triggeredRules;
  }

  /**
   * Interactive Sandbox Rule Tester (used from Frontend Rule Builder)
   */
  testRule(ruleData, samplePayload) {
    const { metric, operator, threshold } = ruleData;
    const value = samplePayload[metric];

    if (value === undefined) {
      return {
        matched: false,
        reason: `Metric '${metric}' was not found in the sample payload.`,
        value: null,
      };
    }

    const matched = this.evaluateCondition(value, operator, threshold);
    const reason = matched
      ? `Condition SATISFIED: ${value} ${operator} ${threshold} evaluates to TRUE.`
      : `Condition NOT satisfied: ${value} ${operator} ${threshold} evaluates to FALSE.`;

    return {
      matched,
      reason,
      value,
      operator,
      threshold,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RuleEngine();
