const { inMemoryStore } = require('../config/db');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');

class ExecutionService {
  async createExecution({ workflowId, userId, workflowSnapshot, inputs }) {
    const executionData = {
      workflowId,
      owner: userId,
      workflowSnapshot: workflowSnapshot || {},
      status: 'PENDING',
      currentNode: null,
      startTime: new Date(),
      inputs: inputs || {},
      outputs: {},
      error: null,
      retryCount: 0,
      langGraph: 'available'
    };

    if (!inMemoryStore.isInMemory) {
      const execution = await Execution.create(executionData);
      return await Execution.findById(execution._id)
        .populate('workflowId', 'name description')
        .populate('owner', 'name email')
        .lean();
    }

    const id = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const execution = {
      _id: id,
      id,
      ...executionData,
      createdAt: now,
      updatedAt: now
    };
    inMemoryStore.executions.set(id, execution);
    return execution;
  }

  async getExecutionById(id, userId) {
    if (!inMemoryStore.isInMemory) {
      const execution = await Execution.findOne({ _id: id })
        .populate('workflowId', 'name description nodes edges')
        .populate('owner', 'name email')
        .lean();
      
      if (!execution) return null;
      
      const logs = await ExecutionLog.find({ executionId: id })
        .sort({ createdAt: 1 })
        .lean();

      return { ...execution, logs: logs || [] };
    }

    const execution = inMemoryStore.executions.get(id);
    if (!execution) return null;

    const logs = [];
    for (const log of inMemoryStore.executionLogs.values()) {
      if (String(log.executionId) === String(id)) {
        logs.push(log);
      }
    }
    logs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    return { ...execution, logs };
  }

  async getExecutionsByUser(userId) {
    if (!inMemoryStore.isInMemory) {
      return await Execution.find({ owner: userId })
        .populate('workflowId', 'name description')
        .sort({ createdAt: -1 })
        .lean();
    }

    const list = [];
    for (const exec of inMemoryStore.executions.values()) {
      if (String(exec.owner) === String(userId) || String(exec.owner?._id) === String(userId)) {
        list.push(exec);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async updateExecutionStatus(id, { status, currentNode, outputs, error, retryCount, endTime, duration }) {
    if (!inMemoryStore.isInMemory) {
      const exec = await Execution.findById(id);
      if (!exec) return null;

      if (status) exec.status = status;
      if (currentNode !== undefined) exec.currentNode = currentNode;
      if (outputs) exec.outputs = { ...exec.outputs, ...outputs };
      if (error !== undefined) exec.error = error;
      if (retryCount !== undefined) exec.retryCount = retryCount;
      if (endTime) exec.endTime = endTime;
      if (duration) exec.duration = duration;

      await exec.save();
      return exec.toObject();
    }

    const exec = inMemoryStore.executions.get(id);
    if (!exec) return null;

    if (status) exec.status = status;
    if (currentNode !== undefined) exec.currentNode = currentNode;
    if (outputs) exec.outputs = { ...exec.outputs, ...outputs };
    if (error !== undefined) exec.error = error;
    if (retryCount !== undefined) exec.retryCount = retryCount;
    if (endTime) exec.endTime = endTime;
    if (duration) exec.duration = duration;
    exec.updatedAt = new Date().toISOString();

    inMemoryStore.executions.set(id, exec);
    return exec;
  }

  async addLog({ executionId, workflowId, nodeId, agent, level, message, metadata }) {
    const logData = {
      executionId,
      workflowId,
      nodeId: nodeId || null,
      agent,
      level: level || 'info',
      message,
      metadata: metadata || {}
    };

    if (!inMemoryStore.isInMemory) {
      const log = await ExecutionLog.create(logData);
      return log.toObject();
    }

    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const log = {
      _id: id,
      id,
      ...logData,
      createdAt: now,
      updatedAt: now
    };
    inMemoryStore.executionLogs.set(id, log);
    return log;
  }
}

module.exports = new ExecutionService();
