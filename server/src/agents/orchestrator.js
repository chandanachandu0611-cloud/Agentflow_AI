const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const { inMemoryStore } = require('../config/db');
const Execution = require('../models/Execution');
const Notification = require('../models/Notification');

class Orchestrator {
  constructor() {
    this.langGraphStatus = 'available';
  }

  async runWorkflow(executionId, workflow, userCredentials = {}) {
    const wId = workflow._id || workflow.id;

    // Helper to update execution document state
    const updateExecutionState = async (updates) => {
      if (!inMemoryStore.isInMemory) {
        await Execution.findByIdAndUpdate(executionId, updates);
      } else {
        const ex = inMemoryStore.executions.get(String(executionId));
        if (ex) {
          inMemoryStore.executions.set(String(executionId), { ...ex, ...updates });
        }
      }
    };

    try {
      await updateExecutionState({ status: 'RUNNING', startTime: new Date() });

      // Step 1: PLANNER AGENT
      await monitoringAgent.emitLog(
        executionId, wId, 'planner', 'info',
        'Planner Agent initializing node execution graph topology and topological order.'
      );

      const planResult = await plannerAgent.plan(workflow);
      await monitoringAgent.emitLog(
        executionId, wId, 'planner', 'success',
        `Topological planning complete with confidence score ${planResult.confidenceScore}. Planned ${planResult.totalSteps} steps.`,
        { plan: planResult.executionPlan, confidenceScore: planResult.confidenceScore }
      );

      const nodesMap = new Map((workflow.nodes || []).map(n => [n.id, n]));
      const executionOutputs = {};

      // Step 2: EXECUTION & VALIDATION AGENTS LOOP
      for (const nodeId of planResult.executionPlan) {
        const node = nodesMap.get(nodeId);
        if (!node) continue;

        await updateExecutionState({ currentNode: nodeId });

        await monitoringAgent.emitLog(
          executionId, wId, 'execution', 'info',
          `Executing node "${node.data?.label || node.id}" (Type: ${node.type})`,
          { nodeConfig: node.data?.config },
          nodeId
        );

        let retryCount = 0;
        let stepSuccess = false;
        let stepOutput = null;

        while (!stepSuccess && retryCount <= 3) {
          const rawResult = await executionAgent.executeNode(node, userCredentials);

          // Validate node output
          const validationResult = await validationAgent.validate(rawResult, node);

          if (validationResult.isValid) {
            stepSuccess = true;
            stepOutput = validationResult.validatedOutput;
            executionOutputs[nodeId] = stepOutput;

            await monitoringAgent.emitLog(
              executionId, wId, 'validation', 'success',
              `Validation Agent passed node "${node.data?.label || node.id}". Output verified.`,
              { output: stepOutput },
              nodeId
            );
          } else {
            // Recovery Agent intervention
            await monitoringAgent.emitLog(
              executionId, wId, 'recovery', 'warning',
              `Recovery Agent intercepting failure at node "${node.data?.label || node.id}": ${validationResult.reason}`,
              { errorType: validationResult.errorType },
              nodeId
            );

            const recoveryDecision = await recoveryAgent.handleFailure(validationResult, retryCount, 3);

            if (recoveryDecision.action === 'retry_with_backoff') {
              retryCount = recoveryDecision.nextRetryCount;
              await monitoringAgent.emitLog(
                executionId, wId, 'recovery', 'info',
                recoveryDecision.message,
                { backoffMs: recoveryDecision.backoffMs },
                nodeId
              );
              await new Promise(res => setTimeout(res, Math.min(recoveryDecision.backoffMs, 2000)));
            } else {
              // Escalate failure
              await updateExecutionState({
                status: 'FAILED',
                endTime: new Date(),
                error: { message: recoveryDecision.escalateReason, nodeId }
              });

              await monitoringAgent.emitLog(
                executionId, wId, 'monitoring', 'error',
                `Workflow execution failed & escalated: ${recoveryDecision.escalateReason}`,
                { nodeId },
                nodeId
              );

              // Create notification
              const notifData = {
                owner: workflow.owner,
                workflowId: wId,
                executionId,
                type: 'escalation',
                title: `Workflow Escalation: ${workflow.name}`,
                message: `Execution failed at node "${node.data?.label || node.id}": ${validationResult.reason}`
              };

              if (!inMemoryStore.isInMemory) {
                await Notification.create(notifData);
              } else {
                inMemoryStore.notifications.set(`notif_${Date.now()}`, { ...notifData, _id: `notif_${Date.now()}` });
              }

              return { success: false, error: recoveryDecision.escalateReason };
            }
          }
        }
      }

      // Step 3: COMPLETION
      const endTime = new Date();
      await updateExecutionState({
        status: 'COMPLETED',
        currentNode: null,
        endTime,
        outputs: executionOutputs
      });

      await monitoringAgent.emitLog(
        executionId, wId, 'monitoring', 'success',
        `Workflow "${workflow.name}" completed all agent execution steps successfully.`,
        { outputs: executionOutputs }
      );

      // Create success notification
      const successNotif = {
        owner: workflow.owner,
        workflowId: wId,
        executionId,
        type: 'success',
        title: `Workflow Succeeded: ${workflow.name}`,
        message: `All ${planResult.totalSteps} nodes executed and validated clean.`
      };

      if (!inMemoryStore.isInMemory) {
        await Notification.create(successNotif);
      } else {
        inMemoryStore.notifications.set(`notif_${Date.now()}`, { ...successNotif, _id: `notif_${Date.now()}` });
      }

      return { success: true, outputs: executionOutputs, langGraph: this.langGraphStatus };
    } catch (err) {
      console.error('[Orchestrator Error]', err);
      await updateExecutionState({
        status: 'FAILED',
        endTime: new Date(),
        error: { message: err.message }
      });
      return { success: false, error: err.message };
    }
  }
}

module.exports = new Orchestrator();
