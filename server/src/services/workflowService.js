const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { inMemoryStore } = require('../config/db');
const Workflow = require('../models/Workflow');
const env = require('../config/env');

class WorkflowService {
  parseTemplate(str, context = {}) {
    if (!str) return '';
    const replacements = {
      name: context.customerName || context.name || 'Customer',
      customerName: context.customerName || context.name || 'Customer',
      status: context.status || 'SUCCESS',
      id: context.id || context.executionId || context.ticketId || 'EXEC-9941',
      ticketId: context.ticketId || context.id || 'TICK-8842',
      urgency: context.urgency || 'HIGH',
      sentiment: context.sentiment || 'URGENT / CRITICAL',
      ...context
    };

    return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      if (replacements[key] !== undefined && replacements[key] !== null) {
        return String(replacements[key]);
      }
      return match;
    });
  }

  async sendEmailAction(config = {}, context = {}) {
    const recipient = config.to || config.recipient || 'chandana.chandu.06.11@gmail.com';
    const rawSubject = config.subject || 'Agentflow_AI Workflow Execution Digest';
    const rawBodyText = config.template || config.body || config.message || 'Hello {{name}}, your pipeline ran with status {{status}}. Ticket ID: {{ticketId}}. Urgency: {{urgency}}.';

    const subject = this.parseTemplate(rawSubject, context);
    const bodyText = this.parseTemplate(rawBodyText, context);

    const emailUser = process.env.EMAIL_USER || env.emailUser;
    const emailPass = process.env.EMAIL_PASS || env.emailPass;

    if (emailUser && emailPass && emailPass !== 'your_16_char_app_password_here') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

        const mailOptions = {
          from: `"Agentflow AI Engine" <${emailUser}>`,
          to: recipient,
          subject: subject,
          text: bodyText,
          html: `<div style="font-family: sans-serif; padding: 24px; background: #0a0d14; color: #f8fafc; border-radius: 16px;">
            <h2 style="color: #6366f1; margin-top: 0;">⚡ Agentflow_AI Execution Notice</h2>
            <p style="font-size: 14px;"><strong>Recipient:</strong> ${recipient}</p>
            <p style="font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 16px 0;" />
            <div style="background: #121723; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 13px; color: #e2e8f0; white-space: pre-wrap;">${bodyText}</div>
            <p style="font-size: 11px; color: #64748b; margin-top: 20px;">Automated delivery powered by Agentflow_AI Engine.</p>
          </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer] Email dispatched successfully to ${recipient} | MessageId: ${info.messageId}`);
        return {
          status: 'success',
          delivered: true,
          method: 'Gmail Nodemailer SMTP',
          recipient,
          subject,
          parsedBody: bodyText,
          messageId: info.messageId,
          deliveredAt: new Date().toISOString()
        };
      } catch (err) {
        console.error(`[Nodemailer Error] Email delivery failed to ${recipient}:`, err.message);
        return {
          status: 'failed',
          delivered: false,
          error: err.message,
          recipient,
          subject,
          failedAt: new Date().toISOString()
        };
      }
    }

    console.log(`[Email Action Log] Simulated Gmail delivery to ${recipient} (Subject: "${subject}")`);
    return {
      status: 'success',
      delivered: false,
      method: 'Mock Log Fallback',
      recipient,
      subject,
      parsedBody: bodyText,
      deliveredAt: new Date().toISOString(),
      note: 'Configure valid EMAIL_USER and EMAIL_PASS (App Password) in server/.env for live Gmail delivery.'
    };
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
