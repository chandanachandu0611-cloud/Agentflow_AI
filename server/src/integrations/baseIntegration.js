class BaseIntegration {
  constructor(name) {
    this.name = name;
  }

  async validateCredentials(credentials) {
    throw new Error('validateCredentials() must be implemented by subclass');
  }

  async execute(action, params, credentials) {
    throw new Error('execute() must be implemented by subclass');
  }

  formatError(err) {
    return {
      success: false,
      error: err.message || 'Unknown Integration Error',
      provider: this.name,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BaseIntegration;
