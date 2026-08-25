const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  async validateCredentials(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl)) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { connected: true };
  }

  async execute(action, params, credentials) {
    const val = await this.validateCredentials(credentials);
    if (!val.connected) {
      return this.formatError(new Error(val.error));
    }

    try {
      if (action === 'post_message') {
        const { channel, message } = params;
        if (!message) throw new Error('MISSING_FIELDS: Slack message text is required.');
        console.log(`[SlackIntegration] Posting to channel ${channel || '#general'}: ${message}`);
        return {
          success: true,
          channel: channel || '#general',
          ts: Date.now().toString(),
          status: 'DELIVERED'
        };
      }
      throw new Error(`Unsupported Slack action: ${action}`);
    } catch (err) {
      return this.formatError(err);
    }
  }
}

module.exports = new SlackIntegration();
