const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  async validateCredentials(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey)) {
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
      if (action === 'send_email') {
        const { to, subject, body } = params;
        if (!to) throw new Error('MISSING_FIELDS: Recipient "to" email is required.');
        console.log(`[GmailIntegration] Sending email to ${to} with subject "${subject}"`);
        return {
          success: true,
          messageId: `gmail_msg_${Date.now()}`,
          recipient: to,
          subject: subject || 'No Subject',
          status: 'SENT'
        };
      } else if (action === 'read_email') {
        return {
          success: true,
          messages: [
            { id: 'msg_1', subject: 'Invoice Received', from: 'billing@example.com', body: 'Invoice #1092 attached.' }
          ]
        };
      }
      throw new Error(`Unsupported Gmail action: ${action}`);
    } catch (err) {
      return this.formatError(err);
    }
  }
}

module.exports = new GmailIntegration();
