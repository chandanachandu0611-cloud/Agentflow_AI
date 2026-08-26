const mongoose = require('mongoose');
const { inMemoryStore } = require('../config/db');
const Workflow = require('../models/Workflow');
const env = require('../config/env');
const emailService = require('./emailService');

class WorkflowService {
  parseTemplate(str, context = {}) {
    return emailService.parseTemplate(str, context);
  }

  async sendEmailAction(config = {}, context = {}) {
    return await emailService.sendEmail(config, context);
  }

  async getAllWorkflows(userId) {
    if (!inMemoryStore.isInMemory) {
      return await Workflow.find({ owner: userId })
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 })
        .lean();
    }

    const userWorkflows = [];
    for (const workflow of inMemoryStore.workflows.values()) {
      if (String(workflow.owner) === String(userId) || String(workflow.owner?._id) === String(userId)) {
        userWorkflows.push(workflow);
      }
    }
    return userWorkflows.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  async getWorkflowById(id, userId) {
    if (!inMemoryStore.isInMemory) {
      let query;
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ _id: id }, { id: id }, { slug: id }] };
      } else {
        query = { $or: [{ id: id }, { slug: id }] };
      }

      const workflow = await Workflow.findOne(query)
        .populate('owner', 'name email')
        .lean();

      return workflow;
    }

    let workflow = inMemoryStore.workflows.get(id);
    if (!workflow) {
      for (const wf of inMemoryStore.workflows.values()) {
        if (wf.id === id || wf._id === id || wf.slug === id) {
          workflow = wf;
          break;
        }
      }
    }
    return workflow || null;
  }

  async createWorkflow(data, userId) {
    const workflowData = {
      name: data.name || 'Untitled Workflow',
      description: data.description || '',
      owner: userId,
      status: data.status || 'draft',
      triggerConfig: data.triggerConfig || { type: 'manual' },
      nodes: data.nodes || [],
      edges: data.edges || [],
      version: data.version || 1,
      tags: data.tags || []
    };

    if (!inMemoryStore.isInMemory) {
      const workflow = await Workflow.create(workflowData);
      const populated = await Workflow.findById(workflow._id).populate('owner', 'name email').lean();
      return populated;
    }

    const id = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const workflow = {
      _id: id,
      id,
      ...workflowData,
      createdAt: now,
      updatedAt: now
    };
    inMemoryStore.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id, updateData, userId) {
    if (!inMemoryStore.isInMemory) {
      let query;
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ _id: id }, { id: id }, { slug: id }] };
      } else {
        query = { $or: [{ id: id }, { slug: id }] };
      }
      if (userId) query.owner = userId;

      const existing = await Workflow.findOne(query);
      if (!existing) return null;

      const allowedFields = ['name', 'description', 'status', 'triggerConfig', 'nodes', 'edges', 'version', 'tags'];
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          existing[field] = updateData[field];
        }
      });

      if (updateData.nodes || updateData.edges) {
        existing.version += 1;
      }

      await existing.save();
      return await Workflow.findById(existing._id).populate('owner', 'name email').lean();
    }

    const workflow = inMemoryStore.workflows.get(id);
    if (!workflow) return null;
    if (String(workflow.owner) !== String(userId) && String(workflow.owner?._id) !== String(userId)) {
      return null;
    }

    const allowedFields = ['name', 'description', 'status', 'triggerConfig', 'nodes', 'edges', 'version', 'tags'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        workflow[field] = updateData[field];
      }
    });

    if (updateData.nodes || updateData.edges) {
      workflow.version = (workflow.version || 1) + 1;
    }
    workflow.updatedAt = new Date().toISOString();

    inMemoryStore.workflows.set(id, workflow);
    return workflow;
  }

  async deleteWorkflow(id, userId) {
    if (!inMemoryStore.isInMemory) {
      let query;
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ _id: id }, { id: id }, { slug: id }] };
      } else {
        query = { $or: [{ id: id }, { slug: id }] };
      }
      if (userId) query.owner = userId;

      const result = await Workflow.deleteOne(query);
      return result.deletedCount > 0;
    }

    const workflow = inMemoryStore.workflows.get(id);
    if (!workflow) return false;
    if (String(workflow.owner) !== String(userId) && String(workflow.owner?._id) !== String(userId)) {
      return false;
    }

    return inMemoryStore.workflows.delete(id);
  }
}

module.exports = new WorkflowService();
