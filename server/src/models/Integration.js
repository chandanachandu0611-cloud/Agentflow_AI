const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['gmail', 'slack', 'discord', 'googlesheets', 'openai', 'gemini'],
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected'],
    default: 'connected'
  },
  config: {
    type: Object,
    default: {}
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
