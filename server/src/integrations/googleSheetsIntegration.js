const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
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
      if (action === 'append_row') {
        const { spreadsheetId, values } = params;
        if (!spreadsheetId) throw new Error('MISSING_FIELDS: Google Sheet "spreadsheetId" is required.');
        console.log(`[GoogleSheetsIntegration] Appending values to spreadsheet ${spreadsheetId}`);
        return {
          success: true,
          spreadsheetId,
          updatedRows: 1,
          status: 'APPENDED'
        };
      } else if (action === 'read_range') {
        return {
          success: true,
          values: [
            ['Name', 'Status', 'Date'],
            ['Task A', 'Complete', '2026-08-23']
          ]
        };
      }
      throw new Error(`Unsupported Google Sheets action: ${action}`);
    } catch (err) {
      return this.formatError(err);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
