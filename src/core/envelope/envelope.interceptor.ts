import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { success } from './envelope.helper';

/**
 * Interceptor that wraps all successful responses in the envelope format.
 * 
 * This runs after the controller returns a response. If the controller
 * returns a plain object/array, it wraps it in { statusCode, message, data, metadata }.
 * 
 * If the controller already returns an envelope (has statusCode and data fields),
 * it passes through unchanged.
 */
@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        // If response is already an envelope, return as-is
        if (response && typeof response === 'object' && 'statusCode' in response && 'data' in response) {
          return response;
        }

        // Otherwise, wrap in envelope
        return success(response);
      }),
    );
  }
}
