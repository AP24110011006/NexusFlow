const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

router.post('/', telemetryController.ingestTelemetry);
router.get('/', telemetryController.getTelemetry);
router.get('/stats', telemetryController.getTelemetryStats);
router.get('/device/:deviceId', telemetryController.getDeviceTelemetry);

module.exports = router;
