const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { connectDB, inMemoryStore } = require('./config/db');
const { initSocket } = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'https://agentflow-ai-gold.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  env.clientUrl
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check Route (Requirement 3)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend is running'
  });
});

// API Routes (Mounted under both /api/... and /... for seamless path compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/workflows', workflowRoutes);
app.use('/workflows', workflowRoutes);

app.use('/api/executions', executionRoutes);
app.use('/executions', executionRoutes);

app.use('/api/integrations', integrationRoutes);
app.use('/integrations', integrationRoutes);

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend is running'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    inMemoryPersistence: inMemoryStore.isInMemory
  });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`[404 Not Found] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || env.port || 5000;
  const HOST = '0.0.0.0';

  server.listen(PORT, HOST, () => {
    console.log(`===================================================`);
    console.log(`🚀 Agentflow_AI Server running on http://${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${env.nodeEnv}`);
    console.log(`💾 Persistence Mode: ${inMemoryStore.isInMemory ? 'IN-MEMORY FALLBACK' : 'MONGODB CONNECTED'}`);
    console.log(`===================================================`);
  });
};

startServer();

module.exports = { app, server };
