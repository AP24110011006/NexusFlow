const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStats);
router.post('/:id/acknowledge', alertController.acknowledgeAlert);
router.post('/:id/resolve', alertController.resolveAlert);
router.delete('/clear-resolved', alertController.clearResolved);

module.exports = router;
