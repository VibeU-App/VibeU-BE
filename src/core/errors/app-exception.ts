import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessage } from './error-codes';

const ErrorCodeToHttpStatus: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.AUTH_INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_OTP_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.AUTH_OTP_EXPIRED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.AUTH_USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.AUTH_WEAK_PASSWORD]: HttpStatus.BAD_REQUEST,
  [ErrorCode.AUTH_INVALID_EMAIL]: HttpStatus.BAD_REQUEST,
  [ErrorCode.AUTH_FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.AUTH_USER_NOT_VERIFIED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_MATCHING_OLD_PASSWORD]: HttpStatus.BAD_REQUEST,
  [ErrorCode.AUTH_SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.PROFILE_USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PROFILE_USER_NOT_OLD_ENOUGH]: HttpStatus.BAD_REQUEST,
  [ErrorCode.VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

/**
 * Custom application exception that includes an error code.
 * 
 * The envelope filter catches this and includes the error code
 * in the response metadata for the frontend to handle.
 */
export class AppException extends HttpException {
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, statusCode?: HttpStatus, customMessage?: string) {
    const message = customMessage ?? ErrorMessage[code];
    const status = statusCode ?? ErrorCodeToHttpStatus[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    super(message, status);
    this.code = code;
  }
}
