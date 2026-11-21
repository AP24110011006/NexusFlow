/**
 * NexusFlow — Webhook API Controller
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — External Webhook Management
 * Organization: Infotact Solutions
 */

const webhookService = require('../services/webhookService');

exports.getWebhooks = (req, res) => {
  try {
    const webhooks = webhookService.getWebhooks();
    return res.json({ webhooks, count: webhooks.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createWebhook = (req, res) => {
  try {
    const { name, url, secret, events, enabled } = req.body;
    const webhook = webhookService.createWebhook({ name, url, secret, events, enabled });
    return res.status(201).json({ message: 'Webhook registered successfully', webhook });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteWebhook = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = webhookService.deleteWebhook(id);
    if (!deleted) {
      return res.status(404).json({ error: `Webhook with id ${id} not found` });
    }
    return res.json({ message: 'Webhook deleted successfully', id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.testWebhook = async (req, res) => {
  try {
    const { url, secret } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Destination URL is required for testing' });
    }
    const testResult = await webhookService.testWebhook(url, secret);
    return res.json({ message: 'Test webhook dispatched', testResult });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
