/**
 * NexusFlow — Webhook API Routes
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — External Webhook API Endpoints
 * Organization: Infotact Solutions
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.get('/', webhookController.getWebhooks);
router.post('/', webhookController.createWebhook);
router.delete('/:id', webhookController.deleteWebhook);
router.post('/test', webhookController.testWebhook);

module.exports = router;
