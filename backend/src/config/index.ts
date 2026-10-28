import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: (process.env.CORS_ORIGIN || 'https://tavi-financial-app.onrender.com,https://teeblee512.github.io,http://localhost:3000').split(','),
  jwt: {
    secret: process.env.JWT_SECRET || 'tavi_dev_jwt_secret_key_super_secure_min_32_characters',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'tavi_dev_refresh_token_secret_key_min_32_chars',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  databaseUrl: process.env.DATABASE_URL || '',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  sandbox: {
    demoStartingBalanceMinor: parseInt(process.env.DEMO_STARTING_BALANCE_MINOR || '25000000', 10), // ₦250,000.00
    storageFile: process.env.SANDBOX_STORAGE_FILE || './data/sandbox_store.json',
    isDemoMode: true,
  },
};
