const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { throttleService } = require('../services/throttleService');

// Sliding-window rate limiter middleware for telemetry ingestion
const telemetryLimiter = throttleService.middleware({ windowMs: 60000, maxRequests: 240 });

router.post('/', telemetryLimiter, telemetryController.ingestTelemetry);
router.post('/batch', telemetryLimiter, telemetryController.ingestBatchTelemetry);
router.get('/', telemetryController.getTelemetry);
router.get('/stats', telemetryController.getTelemetryStats);
router.get('/device/:deviceId', telemetryController.getDeviceTelemetry);

module.exports = router;
