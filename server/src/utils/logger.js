/**
 * Safe logging utility that masks sensitive information
 */

// List of sensitive environment variable keys
const SENSITIVE_KEYS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'API_KEY',
  'SECRET',
  'PASSWORD',
  'TOKEN',
  'PRIVATE_KEY'
];

/**
 * Mask sensitive string values
 * @param {string} value - The value to mask
 * @returns {string} - Masked value
 */
export const maskSensitiveValue = (value) => {
  if (!value || typeof value !== 'string') return value;
  
  const length = value.length;
  if (length <= 4) return '****';
  
  // Show first 4 and last 4 characters
  return `${value.substring(0, 4)}...${value.substring(length - 4)}`;
};

/**
 * Check if a key is sensitive
 * @param {string} key - The key to check
 * @returns {boolean}
 */
const isSensitiveKey = (key) => {
  const upperKey = key.toUpperCase();
  return SENSITIVE_KEYS.some(sensitiveKey => upperKey.includes(sensitiveKey));
};

/**
 * Safely log environment configuration
 * @param {object} config - Configuration object to log
 * @returns {object} - Safe configuration object
 */
export const safeLogConfig = (config) => {
  const safeConfig = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (isSensitiveKey(key)) {
      safeConfig[key] = value ? '***HIDDEN***' : 'Not set';
    } else {
      safeConfig[key] = value;
    }
  }
  
  return safeConfig;
};

/**
 * Log server startup information safely
 */
export const logServerStart = (port, env) => {
  console.log(`
🚀 HabitForge API Server is running!
📍 Environment: ${env}
🌐 Port: ${port}
📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
🔗 API Documentation: http://localhost:${port}/api
  `);
};

/**
 * Log configuration in development mode only
 */
export const logDevConfig = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const config = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN
  };
  
  console.log('🔧 Configuration (sensitive values hidden):');
  console.log(safeLogConfig(config));
};

export default {
  maskSensitiveValue,
  safeLogConfig,
  logServerStart,
  logDevConfig
};
