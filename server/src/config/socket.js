const { Server } = require('socket.io');
const env = require('./env');

let io = null;

const initSocket = (server) => {
  const allowedOrigins = [
    'https://agentflow-ai-gold.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    env.clientUrl
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(null, origin);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_execution', (executionId) => {
      socket.join(`execution_${executionId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: execution_${executionId}`);
    });

    socket.on('leave_execution', (executionId) => {
      socket.leave(`execution_${executionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

const emitExecutionEvent = (executionId, eventName, data) => {
  if (io) {
    io.to(`execution_${executionId}`).emit(eventName, data);
    io.emit('execution_update', { executionId, eventName, data });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent
};
