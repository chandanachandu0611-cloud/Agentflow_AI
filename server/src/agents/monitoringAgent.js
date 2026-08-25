const { emitExecutionEvent } = require('../config/socket');
const { inMemoryStore } = require('../config/db');
const ExecutionLog = require('../models/ExecutionLog');

class MonitoringAgent {
  async emitLog(executionId, workflowId, agent, level, message, metadata = {}, nodeId = null) {
    const logData = {
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      createdAt: new Date().toISOString()
    };

    console.log(`[MonitoringAgent] [${agent.toUpperCase()}] [${level.toUpperCase()}] Execution: ${executionId} | ${message}`);

    // Persist to MongoDB or in-memory fallback
    if (!inMemoryStore.isInMemory) {
      try {
        await ExecutionLog.create(logData);
      } catch (err) {
        console.error('[MonitoringAgent] Error saving DB log:', err.message);
      }
    } else {
      const logs = inMemoryStore.executionLogs.get(String(executionId)) || [];
      logs.push({ ...logData, _id: `log_${Date.now()}_${Math.random()}` });
      inMemoryStore.executionLogs.set(String(executionId), logs);
    }

    // Broadcast live event over Socket.IO
    emitExecutionEvent(executionId, 'agent_event', logData);

    return logData;
  }
}

module.exports = new MonitoringAgent();
