const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');

router.get('/status', simulatorController.getStatus);
router.post('/start', simulatorController.start);
router.post('/stop', simulatorController.stop);
router.post('/inject', simulatorController.injectAnomaly);

module.exports = router;
