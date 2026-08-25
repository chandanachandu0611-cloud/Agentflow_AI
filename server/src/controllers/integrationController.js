const integrationService = require('../services/integrationService');

class IntegrationController {
  async getIntegrations(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const integrations = await integrationService.getUserIntegrations(userId);

      return res.status(200).json({
        success: true,
        count: integrations.length,
        integrations
      });
    } catch (error) {
      console.error('[IntegrationController.getIntegrations Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch integrations.'
      });
    }
  }

  async connectIntegration(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { provider } = req.params;
      const config = req.body || {};

      const integration = await integrationService.connectIntegration(userId, provider, config);

      return res.status(200).json({
        success: true,
        message: `Successfully connected ${provider} integration.`,
        integration
      });
    } catch (error) {
      console.error('[IntegrationController.connectIntegration Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to connect integration.'
      });
    }
  }

  async disconnectIntegration(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { provider } = req.params;

      await integrationService.disconnectIntegration(userId, provider);

      return res.status(200).json({
        success: true,
        message: `Disconnected ${provider} integration.`
      });
    } catch (error) {
      console.error('[IntegrationController.disconnectIntegration Error]', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to disconnect integration.'
      });
    }
  }
}

module.exports = new IntegrationController();
