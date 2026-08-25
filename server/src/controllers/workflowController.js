const { validationResult } = require('express-validator');
const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');

class WorkflowController {
  async generateWorkflow(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { prompt } = req.body;
      const result = await aiService.generateWorkflowFromPrompt(prompt);

      return res.status(200).json({
        success: true,
        workflow: result
      });
    } catch (error) {
      console.error('[WorkflowController.generateWorkflow Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate workflow from prompt.'
      });
    }
  }

  async getWorkflows(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const workflows = await workflowService.getAllWorkflows(userId);
      return res.status(200).json({
        success: true,
        count: workflows.length,
        workflows
      });
    } catch (error) {
      console.error('[WorkflowController.getWorkflows Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflows.'
      });
    }
  }

  async getWorkflowById(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { id } = req.params;
      const workflow = await workflowService.getWorkflowById(id, userId);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found or access denied.'
        });
      }

      return res.status(200).json({
        success: true,
        workflow
      });
    } catch (error) {
      console.error('[WorkflowController.getWorkflowById Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflow.'
      });
    }
  }

  async createWorkflow(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const userId = req.user._id || req.user.id;
      const workflow = await workflowService.createWorkflow(req.body, userId);

      return res.status(201).json({
        success: true,
        workflow
      });
    } catch (error) {
      console.error('[WorkflowController.createWorkflow Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create workflow.'
      });
    }
  }

  async updateWorkflow(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const userId = req.user._id || req.user.id;
      const { id } = req.params;
      const updated = await workflowService.updateWorkflow(id, req.body, userId);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found or access denied.'
        });
      }

      return res.status(200).json({
        success: true,
        workflow: updated
      });
    } catch (error) {
      console.error('[WorkflowController.updateWorkflow Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update workflow.'
      });
    }
  }

  async deleteWorkflow(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { id } = req.params;
      const deleted = await workflowService.deleteWorkflow(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found or access denied.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Workflow deleted successfully.'
      });
    } catch (error) {
      console.error('[WorkflowController.deleteWorkflow Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete workflow.'
      });
    }
  }
}

module.exports = new WorkflowController();
