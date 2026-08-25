const mongoose = require('mongoose');

const agentMemorySchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  executionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    required: true
  },
  agentId: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  confidenceScore: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);
