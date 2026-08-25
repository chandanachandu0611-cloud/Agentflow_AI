const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async validateCredentials(credentials) {
    if (!credentials || (!credentials.botToken && !credentials.webhookUrl)) {
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
      if (action === 'post_bot_message') {
        const { channelId, message } = params;
        if (!message) throw new Error('MISSING_FIELDS: Discord message text is required.');
        console.log(`[DiscordIntegration] Posting to channel ${channelId || 'general'}: ${message}`);
        return {
          success: true,
          channelId: channelId || 'general',
          id: `discord_msg_${Date.now()}`,
          status: 'POSTED'
        };
      }
      throw new Error(`Unsupported Discord action: ${action}`);
    } catch (err) {
      return this.formatError(err);
    }
  }
}

module.exports = new DiscordIntegration();
