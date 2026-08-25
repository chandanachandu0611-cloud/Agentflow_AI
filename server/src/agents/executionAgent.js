const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

class ExecutionAgent {
  async executeNode(node, contextCredentials = {}) {
    const { type, data } = node;
    const nodeConfig = data?.config || data || {};

    switch (type) {
      case 'trigger':
      case 'manualTrigger':
      case 'webhook':
        return {
          success: true,
          output: { event: 'TRIGGERED', timestamp: new Date().toISOString() }
        };

      case 'gmail':
      case 'sendEmail': {
        const credentials = contextCredentials.gmail || { accessToken: 'demo_token' };
        const action = nodeConfig.action || 'send_email';
        const params = {
          to: nodeConfig.to || 'operator@example.com',
          subject: nodeConfig.subject || 'Automated Alert from Agentflow_AI',
          body: nodeConfig.body || 'Automation workflow completed successfully.'
        };
        return await gmailIntegration.execute(action, params, credentials);
      }

      case 'slack':
      case 'slackMessage': {
        const credentials = contextCredentials.slack || { webhookUrl: 'http://slack.demo' };
        const action = 'post_message';
        const params = {
          channel: nodeConfig.channel || '#general',
          message: nodeConfig.message || 'Workflow notification from Agentflow_AI.'
        };
        return await slackIntegration.execute(action, params, credentials);
      }

      case 'discord':
      case 'discordMessage': {
        const credentials = contextCredentials.discord || { webhookUrl: 'http://discord.demo' };
        const action = 'post_bot_message';
        const params = {
          channelId: nodeConfig.channelId || 'general',
          message: nodeConfig.message || 'Discord alert triggered by Agentflow_AI.'
        };
        return await discordIntegration.execute(action, params, credentials);
      }

      case 'sheets':
      case 'googleSheets': {
        const credentials = contextCredentials['google-sheets'] || { accessToken: 'demo_token' };
        const action = 'append_row';
        const params = {
          spreadsheetId: nodeConfig.spreadsheetId || 'sheet_sample_123',
          values: nodeConfig.values || ['Automated Row', 'Active', new Date().toISOString()]
        };
        return await googleSheetsIntegration.execute(action, params, credentials);
      }

      case 'aiPrompt':
      case 'llmTask': {
        return {
          success: true,
          output: {
            text: `[AI Agent Response] Processed prompt "${nodeConfig.prompt || 'Summarize data'}" with confidence score 0.96.`
          }
        };
      }

      default:
        return {
          success: true,
          output: { message: `Executed custom node type: ${type}`, nodeData: nodeConfig }
        };
    }
  }
}

module.exports = new ExecutionAgent();
