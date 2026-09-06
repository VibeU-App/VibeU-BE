import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Envelope } from './envelope.interface';
import { AppException } from '../errors/app-exception';
import { ErrorCode, ErrorMessage } from '../errors/error-codes';

/**
 * Global exception filter that catches all exceptions and returns
 * them in the envelope format.
 *
 * This ensures that even errors follow the standard structure:
 * { statusCode, message, data: null, metadata: null }
 *
 * The frontend can always parse responses using the same logic,
 * regardless of whether the request succeeded or failed.
 */
@Catch()
export class EnvelopeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

    if (exception instanceof AppException) {
      // Handle our custom AppException
      statusCode = exception.getStatus();
      errorCode = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions (BadRequest, NotFound, etc.)
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
        errorCode = (exceptionResponse as any).code || errorCode;
      }
    } else if (exception instanceof Error) {
      // Handle unexpected errors
      message = exception.message || message;
    }

    // Build envelope error response
    const envelope: Envelope = {
      statusCode,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
      metadata: {
        errorCode,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(envelope);
  }
}
