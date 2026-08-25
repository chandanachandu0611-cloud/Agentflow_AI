const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  id: {
    type: String
  },
  slug: {
    type: String
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'active'
  },
  triggerConfig: {
    type: Object,
    default: { type: 'manual' }
  },
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
