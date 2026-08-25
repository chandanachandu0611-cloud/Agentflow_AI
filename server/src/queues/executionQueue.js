const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let queueInstance = null;

// BullMQ Queue setup with automated in-memory asynchronous fallback
const initQueue = () => {
  try {
    const { Queue, Worker } = require('bullmq');
    const Redis = require('ioredis');

    const connection = new Redis({
      host: env.redisHost,
      port: env.redisPort,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false
    });

    connection.on('error', (err) => {
      console.warn('[Queue Warning] Redis connection unavailable. Falling back to in-memory asynchronous queue.');
    });

    const executionQueue = new Queue('workflowExecutions', { connection });

    const worker = new Worker('workflowExecutions', async (job) => {
      const { executionId, workflow, credentials } = job.data;
      return await orchestrator.runWorkflow(executionId, workflow, credentials);
    }, { connection });

    worker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
    });

    queueInstance = executionQueue;
    console.log('[Queue] BullMQ execution queue initialized.');
  } catch (err) {
    console.warn('[Queue Warning] BullMQ or Redis not present. Running with asynchronous in-memory background worker.');
  }
};

const addExecutionJob = async (executionId, workflow, credentials = {}) => {
  if (queueInstance) {
    try {
      await queueInstance.add('executeWorkflow', { executionId, workflow, credentials });
      return { queueType: 'bullmq', queued: true };
    } catch (err) {
      console.warn('[Queue Warning] BullMQ push failed. Processing asynchronously in-memory.');
    }
  }

  // In-memory asynchronous background worker execution
  setImmediate(async () => {
    await orchestrator.runWorkflow(executionId, workflow, credentials);
  });

  return { queueType: 'in-memory-async', queued: true };
};

module.exports = {
  initQueue,
  addExecutionJob
};
