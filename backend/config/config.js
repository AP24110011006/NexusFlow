const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'nexusflow-secret-internship-2026',
  jwtExpiresIn: '7d',
  simulator: {
    intervalMs: parseInt(process.env.SIMULATOR_INTERVAL || '3000', 10),
    autoStart: process.env.SIMULATOR_AUTOSTART !== 'false',
  },
  dataPath: path.join(__dirname, '..', 'data'),
};
