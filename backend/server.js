const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const config = require('./config/config');
const store = require('./models/store');
const telemetryService = require('./services/telemetryService');
const ruleEngine = require('./services/ruleEngine');
const alertService = require('./services/alertService');
const iotSimulator = require('./simulators/iotSimulator');

// Route imports
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const alertRoutes = require('./routes/alertRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logRoutes = require('./routes/logRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Wire Socket.io to services
telemetryService.setSocketIO(io);
ruleEngine.setSocketIO(io);
alertService.setSocketIO(io);
iotSimulator.setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  // Send initial status packet
  socket.emit('simulator:status', iotSimulator.getStatus());
  socket.emit('stats:updated', alertService.getAlertStats());

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Root API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'NexusFlow: Visual IoT Telemetry & Rule Engine',
    version: '1.0.0',
    developer: 'Koneti Manikanth (Infotact Solutions Associate L1. Intern)',
    refNo: 'ITS/WEB/1849',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/simulator', simulatorRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 NexusFlow Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server listening on port ${PORT}`);
  console.log(`🏢 Infotact Solutions Internship Project - Ref: ITS/WEB/1849`);
  console.log(`👨‍💻 Developer: Koneti Manikanth (manikanth9878@gmail.com)`);
  console.log('================================================================');

  // Auto-start IoT simulator if enabled
  if (config.simulator.autoStart) {
    iotSimulator.start();
  }
});

module.exports = { app, server, io };
