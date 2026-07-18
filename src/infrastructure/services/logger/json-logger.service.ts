import { LoggerService, Injectable } from '@nestjs/common';

/**
 * Custom logger that outputs structured JSON logs.
 */
@Injectable()
export class JsonLogger implements LoggerService {
  log(message: any, context?: string) {
    this.print('info', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.print('error', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.print('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.print('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.print('verbose', message, context);
  }

  private print(level: string, message: any, context?: string, trace?: string) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message: typeof message === 'object' ? message : String(message),
      ...(trace && { trace }),
    };
    console.log(JSON.stringify(logObject));
  }
}
