import { ErrorCode, ErrorMessage } from './error-codes';

export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.AUTH_INVALID_TOKEN]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_OTP_INVALID]: 400,
  [ErrorCode.AUTH_OTP_EXPIRED]: 400,
  [ErrorCode.AUTH_USER_NOT_FOUND]: 404,
  [ErrorCode.AUTH_WEAK_PASSWORD]: 400,
  [ErrorCode.AUTH_INVALID_EMAIL]: 400,
  [ErrorCode.AUTH_FORBIDDEN]: 403,
  [ErrorCode.AUTH_USER_NOT_VERIFIED]: 401,
  [ErrorCode.AUTH_MATCHING_OLD_PASSWORD]: 400,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  [ErrorCode.PROFILE_USER_NOT_FOUND]: 404,
  [ErrorCode.PROFILE_USER_NOT_OLD_ENOUGH]: 400,
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
};

/**
 * Domain application exception that includes a strongly-typed error code.
 * Pure TypeScript error independent of delivery frameworks.
 */
export class AppException extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, statusCode?: number, customMessage?: string) {
    const message = customMessage ?? ErrorMessage[code] ?? 'An error occurred';
    super(message);
    this.name = 'AppException';
    this.code = code;
    this.statusCode = statusCode ?? ErrorCodeToHttpStatus[code] ?? 500;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  getStatus(): number {
    return this.statusCode;
  }
}
