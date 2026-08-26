const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'https://agentflow-ai-gold.vercel.app',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agentflow_ai',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_agentflow_ai_2026',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '32_bytes_secret_key_encryption!',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  resendApiKey: process.env.RESEND_API_KEY || ''
};
