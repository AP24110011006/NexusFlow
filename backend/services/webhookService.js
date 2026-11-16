/**
 * NexusFlow — Webhook Dispatcher Service
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — Alert Escalation & External Integration
 * Organization: Infotact Solutions
 */

const crypto = require('crypto');
const store = require('../models/store');

class WebhookService {
  constructor() {
    this.webhooks = [];
    this.init();
  }

  init() {
    // Webhooks collection in memory store or initial configuration
    if (!store.data.webhooks) {
      store.data.webhooks = [
        {
          id: 'wh_default_slack',
          name: 'Factory Ops Slack Channel',
          url: 'https://hooks.slack.com/services/MOCK/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          secret: 'nexusflow-webhook-secret-2026',
          events: ['alert:critical', 'alert:warning'],
          enabled: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  getWebhooks() {
    return store.data.webhooks || [];
  }

  createWebhook({ name, url, secret, events = ['alert:critical'], enabled = true }) {
    if (!name || !url) {
      throw new Error('Webhook name and destination URL are required');
    }
    const newWebhook = {
      id: `wh_${crypto.randomBytes(4).toString('hex')}`,
      name,
      url,
      secret: secret || crypto.randomBytes(16).toString('hex'),
      events,
      enabled,
      createdAt: new Date().toISOString(),
    };
    store.data.webhooks.push(newWebhook);
    return newWebhook;
  }

  deleteWebhook(id) {
    const initialLen = store.data.webhooks.length;
    store.data.webhooks = store.data.webhooks.filter((w) => w.id !== id);
    return store.data.webhooks.length < initialLen;
  }

  generateSignature(payloadString, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  formatAlertPayload(alert) {
    return {
      event: `alert:${alert.severity}`,
      timestamp: new Date().toISOString(),
      data: {
        alertId: alert.id,
        ruleName: alert.ruleName,
        deviceId: alert.deviceId,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        severity: alert.severity,
        message: alert.message,
      },
    };
  }

  async dispatchAlert(alert) {
    const activeHooks = (store.data.webhooks || []).filter(
      (w) => w.enabled && (w.events.includes(`alert:${alert.severity}`) || w.events.includes('*'))
    );

    const results = [];
    for (const webhook of activeHooks) {
      const payload = this.formatAlertPayload(alert);
      const payloadString = JSON.stringify(payload);
      const signature = this.generateSignature(payloadString, webhook.secret);

      // In test/simulation mode, record delivery attempt
      results.push({
        webhookId: webhook.id,
        name: webhook.name,
        dispatched: true,
        signature,
        timestamp: payload.timestamp,
      });

      // Log event
      if (store.insert) {
        store.insert('eventLogs', {
          category: 'WEBHOOK',
          action: 'WEBHOOK_DISPATCHED',
          message: `Alert ${alert.id} dispatched to webhook: ${webhook.name}`,
          level: 'info',
          metadata: { webhookId: webhook.id, alertId: alert.id },
        });
      }
    }

    return results;
  }

  testWebhook(webhookUrl, secret = 'test-secret') {
    const samplePayload = {
      event: 'system:test',
      timestamp: new Date().toISOString(),
      message: 'NexusFlow Webhook Connection Verification',
    };
    const payloadStr = JSON.stringify(samplePayload);
    const signature = this.generateSignature(payloadStr, secret);

    return {
      success: true,
      url: webhookUrl,
      signature,
      payload: samplePayload,
      message: 'Webhook test signature and payload generated successfully',
    };
  }
}

module.exports = new WebhookService();
