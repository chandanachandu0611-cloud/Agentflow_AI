class ValidationAgent {
  async validate(nodeResult, node) {
    if (!nodeResult) {
      return {
        isValid: false,
        errorType: 'API_FAILURE',
        reason: 'Execution agent returned empty result'
      };
    }

    if (!nodeResult.success) {
      const errorMsg = nodeResult.error || 'Execution step failed';
      let errorType = 'TRANSIENT';

      if (errorMsg.includes('MISSING_FIELDS')) {
        errorType = 'MISSING_FIELDS';
      } else if (errorMsg.includes('INTEGRATION_NOT_CONNECTED') || errorMsg.includes('AUTH_EXPIRED')) {
        errorType = 'AUTH_EXPIRED';
      } else if (errorMsg.includes('RATE_LIMIT')) {
        errorType = 'RATE_LIMIT';
      } else if (errorMsg.includes('API_FAILURE')) {
        errorType = 'API_FAILURE';
      }

      return {
        isValid: false,
        errorType,
        reason: errorMsg
      };
    }

    return {
      isValid: true,
      validatedOutput: nodeResult.output || nodeResult
    };
  }
}

module.exports = new ValidationAgent();
