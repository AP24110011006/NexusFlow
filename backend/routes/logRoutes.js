const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/', logController.getLogs);
router.delete('/clear', logController.clearLogs);

module.exports = router;
