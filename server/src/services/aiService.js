const env = require('../config/env');

class AIService {
  async generateWorkflowFromPrompt(prompt) {
    console.log(`[AIService] Generating workflow graph for prompt: "${prompt}"`);

    const systemPrompt = `You are an expert AI Workflow Compiler for Agentflow_AI.
Given a natural language automation prompt, generate a valid JSON object with React Flow nodes and edges.
The available node types MUST ONLY be:
1. "triggerNode" (subTypes: "manual", "webhook", "schedule", "event")
2. "actionNode" (subTypes: "http", "email", "slack", "db")
3. "aiNode" (subTypes: "planner", "execution", "gemini", "summarizer")
4. "logicNode" (subTypes: "condition", "branch", "delay", "loop")

Respond ONLY with raw JSON matching this exact structure (no markdown formatting, no code blocks):
{
  "name": "Short descriptive workflow name",
  "description": "Summary of workflow pipeline steps",
  "tags": ["tag1", "tag2"],
  "triggerConfig": { "type": "manual" },
  "nodes": [
    {
      "id": "unique_string_id",
      "type": "triggerNode | actionNode | aiNode | logicNode",
      "position": { "x": 250, "y": 50 },
      "data": {
        "label": "Node Display Title",
        "subType": "webhook | http | gemini | condition | etc.",
        "category": "triggers | actions | ai | logic",
        "description": "Node description",
        "config": { key-value configurations }
      }
    }
  ],
  "edges": [
    {
      "id": "e_source_target",
      "source": "source_node_id",
      "target": "target_node_id",
      "animated": true,
      "style": { "stroke": "#6366f1", "strokeWidth": 2 }
    }
  ]
}`;

    // Priority 1: OpenRouter API
    if (env.openRouterApiKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.openRouterApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Compile this automation request into a React Flow graph JSON: "${prompt}"` }
            ]
          })
        });
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const cleanJson = content.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          return this.sanitizeWorkflowGraph(parsed, 'openrouter');
        }
      } catch (err) {
        console.warn(`[AIService Warning] OpenRouter API call failed (${err.message}). Falling back to Gemini/Rule builder.`);
      }
    }

    // Priority 2: Gemini SDK
    if (env.geminiApiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`${systemPrompt}\n\nTask prompt: "${prompt}"`);
        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return this.sanitizeWorkflowGraph(parsed, 'gemini');
      } catch (err) {
        console.warn(`[AIService Warning] Gemini SDK call failed (${err.message}). Falling back to deterministic rule builder.`);
      }
    }

    // Priority 3: Deterministic Rule-Based Builder
    return this.buildDeterministicWorkflow(prompt);
  }

  buildDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();
    let name = 'AI Generated Automation Pipeline';
    let description = `Autonomous workflow compiled for prompt: "${prompt}"`;
    let tags = ['ai-generated', 'automation'];

    // Determine Trigger
    let triggerSubType = 'manual';
    let triggerLabel = 'Manual Trigger';
    let triggerConfig = { type: 'manual' };

    if (p.includes('webhook') || p.includes('api call') || p.includes('http post')) {
      triggerSubType = 'webhook';
      triggerLabel = 'Webhook Trigger';
      triggerConfig = { path: '/webhook/v1/trigger' };
    } else if (p.includes('cron') || p.includes('schedule') || p.includes('daily') || p.includes('every hour')) {
      triggerSubType = 'schedule';
      triggerLabel = 'Schedule Cron Trigger';
      triggerConfig = { cron: '0 * * * *' };
    } else if (p.includes('event') || p.includes('listen')) {
      triggerSubType = 'event';
      triggerLabel = 'Event Listener';
      triggerConfig = { topic: 'system.event' };
    }

    const nodes = [
      {
        id: 'node_1_trigger',
        type: 'triggerNode',
        position: { x: 250, y: 50 },
        data: {
          label: triggerLabel,
          subType: triggerSubType,
          category: 'triggers',
          description: 'Pipeline entrypoint trigger',
          config: triggerConfig
        }
      }
    ];

    const edges = [];
    let currentY = 180;
    let prevNodeId = 'node_1_trigger';
    let stepCount = 2;

    // Step: Planner Agent or Analysis
    if (p.includes('plan') || p.includes('agent') || p.includes('complex') || p.includes('classify')) {
      const plannerId = `node_${stepCount}_planner`;
      nodes.push({
        id: plannerId,
        type: 'aiNode',
        position: { x: 250, y: currentY },
        data: {
          label: 'Planner Agent (DAG Ordering)',
          subType: 'planner',
          category: 'ai',
          description: 'Calculates execution order and agent confidence scores',
          config: { model: 'Gemini 1.5 Pro', confidenceThreshold: 0.85 }
        }
      });
      edges.push({
        id: `e_${prevNodeId}_${plannerId}`,
        source: prevNodeId,
        target: plannerId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
      prevNodeId = plannerId;
      currentY += 150;
      stepCount++;
    }

    // Step: AI Reasoning / Prompt
    const aiId = `node_${stepCount}_ai`;
    nodes.push({
      id: aiId,
      type: 'aiNode',
      position: { x: 250, y: currentY },
      data: {
        label: 'Gemini AI Processor',
        subType: 'gemini',
        category: 'ai',
        description: `Analyzes payload and executes prompt logic for: "${prompt}"`,
        config: { model: 'Gemini 1.5 Flash', prompt: `Process incoming data according to: ${prompt}`, temperature: 0.7 }
      }
    });
    edges.push({
      id: `e_${prevNodeId}_${aiId}`,
      source: prevNodeId,
      target: aiId,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    });
    prevNodeId = aiId;
    currentY += 150;
    stepCount++;

    // Step: Condition / Logic if requested
    if (p.includes('if') || p.includes('condition') || p.includes('verify') || p.includes('filter')) {
      const condId = `node_${stepCount}_logic`;
      nodes.push({
        id: condId,
        type: 'logicNode',
        position: { x: 250, y: currentY },
        data: {
          label: 'Evaluate Output Condition',
          subType: 'condition',
          category: 'logic',
          description: 'Branches execution based on result validity',
          config: { condition: 'payload.confidence >= 0.8' }
        }
      });
      edges.push({
        id: `e_${prevNodeId}_${condId}`,
        source: prevNodeId,
        target: condId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
      prevNodeId = condId;
      currentY += 150;
      stepCount++;
    }

    // Step: Actions (Email / Slack / HTTP / Database)
    if (p.includes('email') || p.includes('gmail') || p.includes('notify') || p.includes('alert')) {
      const emailId = `node_${stepCount}_email`;
      nodes.push({
        id: emailId,
        type: 'actionNode',
        position: { x: 120, y: currentY },
        data: {
          label: 'Send Email Notification',
          subType: 'email',
          category: 'actions',
          description: 'Dispatches summary alert to team',
          config: { to: 'operations@company.com', subject: `Workflow Execution: ${prompt}` }
        }
      });
      edges.push({
        id: `e_${prevNodeId}_${emailId}`,
        source: prevNodeId,
        target: emailId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
      stepCount++;
    }

    if (p.includes('slack') || p.includes('chat') || p.includes('channel') || !p.includes('email')) {
      const slackId = `node_${stepCount}_slack`;
      nodes.push({
        id: slackId,
        type: 'actionNode',
        position: { x: 380, y: currentY },
        data: {
          label: 'Post Slack Alert',
          subType: 'slack',
          category: 'actions',
          description: 'Posts live message to Slack channel',
          config: { channel: '#automation-alerts', message: `🚀 Workflow completed for: ${prompt}` }
        }
      });
      edges.push({
        id: `e_${prevNodeId}_${slackId}`,
        source: prevNodeId,
        target: slackId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
      stepCount++;
    }

    if (p.includes('db') || p.includes('database') || p.includes('sheet') || p.includes('record')) {
      currentY += 150;
      const dbId = `node_${stepCount}_db`;
      nodes.push({
        id: dbId,
        type: 'actionNode',
        position: { x: 250, y: currentY },
        data: {
          label: 'Persist Result to DB',
          subType: 'db',
          category: 'actions',
          description: 'Logs execution record into database',
          config: { query: 'INSERT INTO execution_logs (prompt, status) VALUES (?, ?)' }
        }
      });
      edges.push({
        id: `e_${prevNodeId}_${dbId}`,
        source: prevNodeId,
        target: dbId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
    }

    if (p.includes('lead')) {
      name = 'AI Lead Qualification & Outreach Pipeline';
    } else if (p.includes('support') || p.includes('ticket')) {
      name = 'AI Customer Support Ticket Categorizer';
    } else if (p.includes('report') || p.includes('sales')) {
      name = 'Automated Sales & Analytics Reporter';
    }

    return {
      provider: 'deterministic-rule-builder',
      name,
      description,
      tags,
      triggerConfig,
      nodes,
      edges
    };
  }

  sanitizeWorkflowGraph(parsed, provider) {
    const validNodeTypes = ['triggerNode', 'actionNode', 'aiNode', 'logicNode'];
    const nodes = Array.isArray(parsed.nodes)
      ? parsed.nodes.map((node, index) => {
          const nodeType = validNodeTypes.includes(node.type) ? node.type : 'actionNode';
          return {
            id: node.id || `node_${index + 1}`,
            type: nodeType,
            position: node.position || { x: 250, y: 50 + index * 140 },
            data: {
              label: node.data?.label || 'Generated Step',
              subType: node.data?.subType || 'default',
              category: node.data?.category || 'actions',
              description: node.data?.description || '',
              config: node.data?.config || {}
            }
          };
        })
      : [];

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = Array.isArray(parsed.edges)
      ? parsed.edges
          .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
          .map((e, index) => ({
            id: e.id || `e_${e.source}_${e.target}`,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 }
          }))
      : [];

    return {
      provider,
      name: parsed.name || 'AI Generated Workflow',
      description: parsed.description || 'Generated from AI prompt',
      tags: parsed.tags || ['ai-generated'],
      triggerConfig: parsed.triggerConfig || { type: 'manual' },
      nodes,
      edges
    };
  }
}

module.exports = new AIService();
