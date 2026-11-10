const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/reset-demo', settingsController.resetDemoData);
router.get('/diagnostics', settingsController.getDiagnostics);

module.exports = router;
