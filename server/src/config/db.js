const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./env');

// In-memory fallback database for local execution without network/database
const inMemoryStore = {
  users: new Map(),
  workflows: new Map(),
  executions: new Map(),
  executionLogs: new Map(),
  integrations: new Map(),
  notifications: new Map(),
  agentMemory: new Map(),
  isInMemory: false
};

const seedDefaultData = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const defaultUserEmail = 'chandana.chandu.06.11@gmail.com';
    const userId = '65f1a2b3c4d5e6f7a8b9c0d1';

    const defaultUserData = {
      _id: userId,
      id: userId,
      name: 'Chandana T P',
      email: defaultUserEmail,
      password: hashedPassword,
      role: 'operator',
      lastLogin: new Date()
    };

    const wf1 = {
      _id: 'wf_seed_customer_support',
      id: 'wf_seed_customer_support',
      name: 'Customer Support Automation',
      description: 'Classify incoming user support tickets with Gemini AI and dispatch Slack alerts.',
      owner: userId,
      status: 'active',
      triggerConfig: { type: 'webhook', path: '/api/v1/tickets/webhook' },
      tags: ['customer-support', 'gemini-ai', 'slack'],
      nodes: [
        { id: 'n1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Support Ticket Webhook', subType: 'webhook', config: { path: '/api/v1/tickets/webhook' } } },
        { id: 'n2', type: 'aiNode', position: { x: 250, y: 180 }, data: { label: 'Gemini Sentiment & Categorizer', subType: 'gemini', config: { prompt: 'Categorize support ticket sentiment and urgency.', model: 'Gemini 1.5 Flash' } } },
        { id: 'n3', type: 'logicNode', position: { x: 250, y: 310 }, data: { label: 'High Urgency Check', subType: 'condition', config: { condition: "urgency == 'HIGH'" } } },
        { id: 'n4', type: 'actionNode', position: { x: 250, y: 440 }, data: { label: 'Dispatch Urgent Slack Alert', subType: 'slack', config: { channel: '#support-alerts', message: 'Urgent ticket received!' } } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e3-4', source: 'n3', target: 'n4', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const wf2 = {
      _id: 'wf_seed_lead_pipeline',
      id: 'wf_seed_lead_pipeline',
      name: 'Lead Notification Pipeline',
      description: 'Ingest new inbound sales leads, enrich data with AI planner, and send email digests.',
      owner: userId,
      status: 'active',
      triggerConfig: { type: 'schedule', cron: '0 * * * *' },
      tags: ['sales', 'ai-planner', 'email'],
      nodes: [
        { id: 'n1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Hourly Lead Ingestion', subType: 'schedule', config: { cron: '0 * * * *' } } },
        { id: 'n2', type: 'aiNode', position: { x: 250, y: 180 }, data: { label: 'Lead Enrichment Planner', subType: 'planner', config: { model: 'Gemini 1.5 Pro' } } },
        { id: 'n3', type: 'actionNode', position: { x: 250, y: 310 }, data: { label: 'Send Sales Team Email Digest', subType: 'email', config: { to: 'chandana.chandu.06.11@gmail.com', subject: 'Hourly Sales Leads Summary' } } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const defaultIntegrations = [
      { _id: `int_${userId}_gmail`, id: `int_${userId}_gmail`, owner: userId, provider: 'gmail', status: 'connected', config: { apiKey: 'gmail-oauth-mock-key' }, connectedAt: new Date().toISOString() },
      { _id: `int_${userId}_slack`, id: `int_${userId}_slack`, owner: userId, provider: 'slack', status: 'connected', config: { webhookUrl: 'https://hooks.slack.com/services/mock' }, connectedAt: new Date().toISOString() },
      { _id: `int_${userId}_discord`, id: `int_${userId}_discord`, owner: userId, provider: 'discord', status: 'disconnected', config: {}, connectedAt: new Date().toISOString() },
      { _id: `int_${userId}_googlesheets`, id: `int_${userId}_googlesheets`, owner: userId, provider: 'googlesheets', status: 'connected', config: { spreadsheetId: 'mock-sheet-id' }, connectedAt: new Date().toISOString() },
      { _id: `int_${userId}_openai`, id: `int_${userId}_openai`, owner: userId, provider: 'openai', status: 'connected', config: { apiKey: 'sk-proj-mock-openai-key' }, connectedAt: new Date().toISOString() },
      { _id: `int_${userId}_gemini`, id: `int_${userId}_gemini`, owner: userId, provider: 'gemini', status: 'connected', config: { apiKey: 'AIzaSy-mock-gemini-key' }, connectedAt: new Date().toISOString() }
    ];

    // Always seed in-memory store
    inMemoryStore.users.set(defaultUserEmail, defaultUserData);
    inMemoryStore.workflows.set(wf1.id, wf1);
    inMemoryStore.workflows.set(wf2.id, wf2);

    defaultIntegrations.forEach((item) => {
      inMemoryStore.integrations.set(item.id, item);
    });

    // If MongoDB is connected, upsert seed records into database
    if (!inMemoryStore.isInMemory) {
      const User = require('../models/User');
      const Workflow = require('../models/Workflow');
      const Integration = require('../models/Integration');

      await User.findOneAndUpdate(
        { email: defaultUserEmail },
        defaultUserData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const wf1ToSave = { ...wf1 };
      delete wf1ToSave._id;
      await Workflow.findOneAndUpdate(
        { id: wf1.id },
        wf1ToSave,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const wf2ToSave = { ...wf2 };
      delete wf2ToSave._id;
      await Workflow.findOneAndUpdate(
        { id: wf2.id },
        wf2ToSave,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      for (const item of defaultIntegrations) {
        const itemToSave = { ...item };
        delete itemToSave._id;
        await Integration.findOneAndUpdate(
          { owner: userId, provider: item.provider },
          itemToSave,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    console.log(`[Database Seed] Pre-populated default user (${defaultUserEmail}), 2 workflows, and connected integrations.`);
  } catch (err) {
    console.error('[Database Seed Error]', err);
  }
};

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[Database] MongoDB connected successfully to Atlas Cluster: ${conn.connection.host}`);
    inMemoryStore.isInMemory = false;
    await seedDefaultData();
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to external MongoDB Atlas (${error.message}). Activating in-memory persistence fallback for seamless local execution.`);
    inMemoryStore.isInMemory = true;
    await seedDefaultData();
  }
};

module.exports = {
  connectDB,
  inMemoryStore,
  seedDefaultData
};
