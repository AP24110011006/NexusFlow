const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/trends', analyticsController.getHistoricalTrends);
router.get('/comparison', analyticsController.getDeviceComparison);
router.get('/sensor-stats', analyticsController.getSensorStatistics);

module.exports = router;
