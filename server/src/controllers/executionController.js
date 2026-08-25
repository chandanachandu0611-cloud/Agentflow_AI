const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');
const multiAgentEngine = require('../services/multiAgentEngine');
const { inMemoryStore } = require('../config/db');

class ExecutionController {
  async runExecution(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;
      const id = req.params.id || req.params.workflowId;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required.'
        });
      }

      let workflow;
      if (!inMemoryStore.isInMemory) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          workflow = await Workflow.findOne({ $or: [{ _id: id }, { id: id }, { slug: id }] }).lean();
        } else {
          workflow = await Workflow.findOne({ $or: [{ id: id }, { slug: id }] }).lean();
        }
      } else {
        workflow = await workflowService.getWorkflowById(id, userId);
      }

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found or access denied.'
        });
      }

      const execution = await executionService.createExecution({
        workflowId: workflow._id || workflow.id,
        userId: userId || workflow.owner,
        workflowSnapshot: workflow,
        inputs: req.body.inputs || {}
      });

      // Run the workflow nodes, execute the email action with Nodemailer, and log success
      await multiAgentEngine.executeWorkflow(execution, workflow);

      // Fetch the updated execution record with outputs and logs
      const updatedExecution = await executionService.getExecutionById(
        execution._id || execution.id,
        userId
      );

      return res.status(200).json({
        success: true,
        execution: updatedExecution || execution
      });
    } catch (error) {
      console.error('[ExecutionController.runExecution Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to start execution.'
      });
    }
  }

  async getExecution(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { id } = req.params;

      const execution = await executionService.getExecutionById(id, userId);
      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution record not found.'
        });
      }

      return res.status(200).json({
        success: true,
        execution
      });
    } catch (error) {
      console.error('[ExecutionController.getExecution Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch execution details.'
      });
    }
  }

  async getExecutions(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const executions = await executionService.getExecutionsByUser(userId);

      return res.status(200).json({
        success: true,
        count: executions.length,
        executions
      });
    } catch (error) {
      console.error('[ExecutionController.getExecutions Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch executions list.'
      });
    }
  }
}

module.exports = new ExecutionController();
