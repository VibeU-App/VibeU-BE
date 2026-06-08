export enum ErrorCode {
  // Auth Errors (1xxx)
  AUTH_INVALID_CREDENTIALS = 'AUTH_1001',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_1002',
  AUTH_INVALID_TOKEN = 'AUTH_1003',
  AUTH_TOKEN_EXPIRED = 'AUTH_1004',
  AUTH_OTP_INVALID = 'AUTH_1005',
  AUTH_OTP_EXPIRED = 'AUTH_1006',
  AUTH_USER_NOT_FOUND = 'AUTH_1007',
  AUTH_WEAK_PASSWORD = 'AUTH_1008',
  AUTH_INVALID_EMAIL = 'AUTH_1009',
  AUTH_FORBIDDEN = 'AUTH_1010',

  // Validation Errors (2xxx)
  VALIDATION_FAILED = 'VAL_2001',

  // Server Errors (5xxx)
  INTERNAL_SERVER_ERROR = 'SRV_5001',
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
  [ErrorCode.AUTH_OTP_INVALID]: 'Invalid or incorrect OTP code',
  [ErrorCode.AUTH_OTP_EXPIRED]: 'OTP code has expired, please request a new one',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  [ErrorCode.AUTH_INVALID_EMAIL]: 'Please provide a valid email address',
  [ErrorCode.AUTH_FORBIDDEN]: 'You do not have permission to access this resource',
  [ErrorCode.VALIDATION_FAILED]: 'Request validation failed',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
};