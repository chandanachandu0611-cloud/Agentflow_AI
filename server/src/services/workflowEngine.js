const multiAgentEngine = require('./multiAgentEngine');
const emailService = require('./emailService');
const executionService = require('./executionService');
const workflowService = require('./workflowService');

class WorkflowEngine {
  async runWorkflow(workflowId, userId, inputs = {}) {
    const workflow = await workflowService.getWorkflowById(workflowId, userId);
    if (!workflow) {
      throw new Error('Workflow not found or access denied.');
    }

    const execution = await executionService.createExecution({
      workflowId: workflow._id || workflow.id,
      userId,
      workflowSnapshot: workflow,
      inputs
    });

    // Launch multi-agent orchestration pipeline
    multiAgentEngine.executeWorkflow(execution, workflow).catch((err) => {
      console.error('[WorkflowEngine Async Execution Error]', err);
    });

    return execution;
  }

  async sendEmailAction(config, context) {
    return await emailService.sendEmail(config, context);
  }
}

module.exports = new WorkflowEngine();
