import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration loaded from environment variables.
 * 
 * This module centralizes all configuration management. It reads from .env file
 * and provides typed access to all config values. If a required variable is missing,
 * the app will fail fast with a clear error message.
 */
export const config = {
  // JWT settings for token signing and verification
  jwt: {
    secretKey: getRequiredEnv('JWT_SECRET_KEY'),
  },

  // SMTP settings for sending emails (Google SMTP)
  smtp: {
    host: getRequiredEnv('SMTP_HOST'),
    port: parseInt(getRequiredEnv('SMTP_PORT'), 10),
    user: getRequiredEnv('SMTP_USER'),
    pass: getRequiredEnv('SMTP_PASS'),
  },

  // PostgreSQL database settings
  database: {
    connectionString: getRequiredEnv('DATABASE_URL'),
  },
};

/**
 * Helper function to get a required environment variable.
 * Throws an error if the variable is not set, preventing the app from running
 * with missing configuration.
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
