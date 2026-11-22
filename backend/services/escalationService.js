/**
 * NexusFlow — Multi-Tier Alert Escalation & Action Dispatcher Service
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — SLA Escalation Chains & Failsafe Actions
 * Organization: Infotact Solutions
 */

class EscalationService {
  constructor() {
    this.policies = new Map();
    this.activeEscalations = new Map(); // alertId -> escalationState
    this.history = [];
    this.initDefaultPolicies();
  }

  initDefaultPolicies() {
    // Critical Policy: 3-tier rapid escalation
    this.policies.set('critical', {
      id: 'policy_critical_standard',
      name: 'Critical Incident Rapid Escalation Chain',
      severity: 'critical',
      levels: [
        { level: 1, delayMinutes: 0, target: 'operator_oncall', channels: ['in_app', 'websocket'] },
        { level: 2, delayMinutes: 10, target: 'plant_supervisor', channels: ['webhook_slack', 'email'] },
        { level: 3, delayMinutes: 30, target: 'incident_commander', channels: ['emergency_sms', 'mqtt_failsafe'] },
      ],
    });

    // Warning Policy: 2-tier standard escalation
    this.policies.set('warning', {
      id: 'policy_warning_standard',
      name: 'Warning Level Escalation Chain',
      severity: 'warning',
      levels: [
        { level: 1, delayMinutes: 0, target: 'operator_oncall', channels: ['in_app'] },
        { level: 2, delayMinutes: 45, target: 'maintenance_lead', channels: ['webhook_slack'] },
      ],
    });
  }

  getPolicy(severity) {
    return this.policies.get(severity) || this.policies.get('warning');
  }

  registerPolicy(severity, policy) {
    if (!severity || !policy || !Array.isArray(policy.levels)) {
      throw new Error('Valid severity and policy levels array are required');
    }
    this.policies.set(severity, policy);
    return policy;
  }

  triggerEscalation(alert) {
    if (!alert || !alert.id) throw new Error('Alert with ID is required');

    const severity = alert.severity || 'warning';
    const policy = this.getPolicy(severity);

    const now = Date.now();
    const escalation = {
      alertId: alert.id,
      deviceId: alert.deviceId,
      severity,
      policyId: policy.id,
      currentLevel: 1,
      maxLevel: policy.levels.length,
      status: 'escalating', // escalating | acknowledged | resolved
      createdAt: now,
      lastEscalatedAt: now,
      timeline: [
        {
          level: 1,
          timestamp: now,
          target: policy.levels[0].target,
          channels: policy.levels[0].channels,
          dispatched: true,
        },
      ],
    };

    this.activeEscalations.set(alert.id, escalation);
    this.history.push({
      event: 'ESCALATION_TRIGGERED',
      alertId: alert.id,
      level: 1,
      timestamp: new Date(now).toISOString(),
    });

    return escalation;
  }

  advanceEscalation(alertId, fakeNow = null) {
    const escalation = this.activeEscalations.get(alertId);
    if (!escalation || escalation.status !== 'escalating') {
      return null;
    }

    const policy = this.policies.get(escalation.severity);
    if (!policy) return null;

    const nextLevel = escalation.currentLevel + 1;
    if (nextLevel > escalation.maxLevel) {
      return null; // Already at max escalation level
    }

    const levelConfig = policy.levels.find((l) => l.level === nextLevel);
    if (!levelConfig) return null;

    const now = fakeNow || Date.now();
    escalation.currentLevel = nextLevel;
    escalation.lastEscalatedAt = now;
    escalation.timeline.push({
      level: nextLevel,
      timestamp: now,
      target: levelConfig.target,
      channels: levelConfig.channels,
      dispatched: true,
    });

    this.history.push({
      event: 'ESCALATION_ADVANCED',
      alertId,
      level: nextLevel,
      target: levelConfig.target,
      timestamp: new Date(now).toISOString(),
    });

    return escalation;
  }

  acknowledge(alertId, acknowledgedBy = 'operator') {
    const escalation = this.activeEscalations.get(alertId);
    if (!escalation) return null;

    const now = Date.now();
    escalation.status = 'acknowledged';
    escalation.acknowledgedAt = now;
    escalation.acknowledgedBy = acknowledgedBy;

    this.history.push({
      event: 'ESCALATION_ACKNOWLEDGED',
      alertId,
      acknowledgedBy,
      timestamp: new Date(now).toISOString(),
    });

    return escalation;
  }

  resolve(alertId, resolvedBy = 'operator') {
    const escalation = this.activeEscalations.get(alertId);
    if (!escalation) return null;

    const now = Date.now();
    escalation.status = 'resolved';
    escalation.resolvedAt = now;
    escalation.resolvedBy = resolvedBy;

    this.history.push({
      event: 'ESCALATION_RESOLVED',
      alertId,
      resolvedBy,
      durationMs: now - escalation.createdAt,
      timestamp: new Date(now).toISOString(),
    });

    this.activeEscalations.delete(alertId);
    return escalation;
  }

  getActiveEscalations() {
    return Array.from(this.activeEscalations.values());
  }

  getEscalation(alertId) {
    return this.activeEscalations.get(alertId) || null;
  }

  getStats() {
    let totalActive = this.activeEscalations.size;
    let criticalCount = 0;
    let warningCount = 0;
    let levelThreeBreaches = 0;

    for (const esc of this.activeEscalations.values()) {
      if (esc.severity === 'critical') criticalCount++;
      if (esc.severity === 'warning') warningCount++;
      if (esc.currentLevel >= 3) levelThreeBreaches++;
    }

    return {
      totalActive,
      criticalCount,
      warningCount,
      levelThreeBreaches,
      totalHistoricalEvents: this.history.length,
    };
  }
}

const escalationService = new EscalationService();

module.exports = escalationService;
module.exports.EscalationService = EscalationService;
