const { inMemoryStore } = require('../config/db');
const Integration = require('../models/Integration');

const PROVIDERS = [
  { id: 'gmail', name: 'Gmail API', category: 'email', description: 'Send automated email notifications & digest reports.' },
  { id: 'slack', name: 'Slack Bot', category: 'chat', description: 'Post workflow alerts & execution status into channels.' },
  { id: 'discord', name: 'Discord Webhook', category: 'chat', description: 'Send rich embed messages & log streams to Discord.' },
  { id: 'googlesheets', name: 'Google Sheets API', category: 'data', description: 'Append workflow outputs & execution rows dynamically.' },
  { id: 'openai', name: 'OpenAI GPT-4o', category: 'ai', description: 'Power autonomous AI nodes with OpenAI LLM models.' },
  { id: 'gemini', name: 'Google Gemini 1.5 Pro', category: 'ai', description: 'Execute fast multimodal & structured AI node tasks.' }
];

class IntegrationService {
  async getUserIntegrations(userId) {
    let connectedMap = new Map();

    if (!inMemoryStore.isInMemory) {
      const docs = await Integration.find({ owner: userId }).lean();
      docs.forEach((doc) => connectedMap.set(doc.provider, doc));
    } else {
      for (const item of inMemoryStore.integrations.values()) {
        if (String(item.owner) === String(userId)) {
          connectedMap.set(item.provider, item);
        }
      }
    }

    return PROVIDERS.map((provider) => {
      const existing = connectedMap.get(provider.id);
      return {
        ...provider,
        status: existing ? existing.status : 'disconnected',
        config: existing ? { ...existing.config, apiKey: existing.config?.apiKey ? '••••••••' + existing.config.apiKey.slice(-4) : undefined } : {},
        connectedAt: existing ? existing.connectedAt || existing.createdAt : null
      };
    });
  }

  async connectIntegration(userId, provider, config) {
    const validProvider = PROVIDERS.find((p) => p.id === provider);
    if (!validProvider) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }

    if (!inMemoryStore.isInMemory) {
      const integration = await Integration.findOneAndUpdate(
        { owner: userId, provider },
        {
          owner: userId,
          provider,
          status: 'connected',
          config: config || {},
          connectedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      return integration;
    }

    const id = `int_${userId}_${provider}`;
    const integration = {
      _id: id,
      id,
      owner: userId,
      provider,
      status: 'connected',
      config: config || {},
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryStore.integrations.set(id, integration);
    return integration;
  }

  async disconnectIntegration(userId, provider) {
    if (!inMemoryStore.isInMemory) {
      await Integration.findOneAndUpdate(
        { owner: userId, provider },
        { status: 'disconnected' }
      );
      return { success: true };
    }

    const id = `int_${userId}_${provider}`;
    const existing = inMemoryStore.integrations.get(id);
    if (existing) {
      existing.status = 'disconnected';
      inMemoryStore.integrations.set(id, existing);
    }
    return { success: true };
  }
}

module.exports = new IntegrationService();
