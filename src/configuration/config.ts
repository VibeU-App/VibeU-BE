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
    // Access token TTL in seconds (default: 1 hour)
    accessTokenTtl: parseInt(getEnvOrDefault('ACCESS_TOKEN_TTL', '3600'), 10),
    // Refresh token TTL in seconds (default: 7 days)
    refreshTokenTtl: parseInt(getEnvOrDefault('REFRESH_TOKEN_TTL', '604800'), 10),
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
    // Connection pool URL (via PgBouncer on Supabase)
    connectionString: getRequiredEnv('DATABASE_URL'),
    // Direct URL for migrations (bypasses PgBouncer)
    directConnectionString: getEnvOrDefault('DIRECT_URL', getRequiredEnv('DATABASE_URL')),
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

/**
 * Helper function to get an environment variable with a default value.
 * Returns the default value if the variable is not set.
 */
function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
