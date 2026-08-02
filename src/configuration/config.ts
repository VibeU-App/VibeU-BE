import * as dotenv from 'dotenv';
import * as Joi from 'joi';

// Load environment variables from .env file
dotenv.config();

// Define Joi schema to validate environment variables
const envVarsSchema = Joi.object({
  JWT_SECRET_KEY: Joi.string()
    .required()
    .description('Secret key to sign JWT tokens'),
  ACCESS_TOKEN_TTL: Joi.number()
    .default(3600)
    .description('Access token lifetime in seconds'),
  REFRESH_TOKEN_TTL: Joi.number()
    .default(604800)
    .description('Refresh token lifetime in seconds'),
  SMTP_HOST: Joi.string().required().description('SMTP server host name'),
  SMTP_PORT: Joi.number().required().description('SMTP server port number'),
  SMTP_USER: Joi.string().required().description('SMTP server user email'),
  SMTP_PASS: Joi.string().required().description('SMTP server password'),
  DATABASE_URL: Joi.string()
    .required()
    .description('Database connection string'),
  DIRECT_URL: Joi.string()
    .default(Joi.ref('DATABASE_URL'))
    .description('Database direct connection string for migrations'),
})
  .unknown()
  .required();

// Validate and cast environment variables
const { error, value: envVars } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Configuration validation failed: ${error.message}`);
}

/**
 * Application configuration loaded and validated using Joi.
 */
export const config = {
  jwt: {
    secretKey: envVars.JWT_SECRET_KEY as string,
    accessTokenTtl: envVars.ACCESS_TOKEN_TTL as number,
    refreshTokenTtl: envVars.REFRESH_TOKEN_TTL as number,
  },
  smtp: {
    host: envVars.SMTP_HOST as string,
    port: envVars.SMTP_PORT as number,
    user: envVars.SMTP_USER as string,
    pass: envVars.SMTP_PASS as string,
  },
  database: {
    connectionString: envVars.DATABASE_URL as string,
    directConnectionString: envVars.DIRECT_URL as string,
  },
};
