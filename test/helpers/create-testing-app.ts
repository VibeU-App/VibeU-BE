import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { EnvelopeInterceptor } from '../../src/core/envelope/envelope.interceptor';
import { EnvelopeExceptionFilter } from '../../src/core/envelope/envelope.filter';

import { IMailService } from '../../src/core/abstracts/mail-service.interface';

/**
 * In-memory Mock Mail Service that records sent emails and parses OTPs for tests.
 */
export class MockMailService implements IMailService {
  public sentMails: Array<{
    to: string;
    subject: string;
    content: string;
    otp?: string;
  }> = [];

  isValidEmail(email: string): boolean {
    return !!email;
  }

  getTargetEmail(email: string): string | null {
    return email;
  }

  send(to: string, subject: string, content: string): Promise<void> {
    const otpMatch = content.match(/\b\d{6}\b/);
    this.sentMails.push({
      to,
      subject,
      content,
      otp: otpMatch ? otpMatch[0] : undefined,
    });
    return Promise.resolve();
  }

  sendMail(to: string, subject: string, content: string): Promise<boolean> {
    const otpMatch = content.match(/\b\d{6}\b/);
    this.sentMails.push({
      to,
      subject,
      content,
      otp: otpMatch ? otpMatch[0] : undefined,
    });
    return Promise.resolve(true);
  }

  getLatestOtpFor(email: string): string | undefined {
    const mail = [...this.sentMails].reverse().find((m) => m.to === email);
    return mail?.otp;
  }

  clear(): void {
    this.sentMails = [];
  }
}

export interface TestingAppContext {
  app: INestApplication;
  mockMailService: MockMailService;
}

/**
 * Factory to bootstrap the NestJS app for integration testing,
 * registering the same global pipes, interceptors, and filters as production.
 */
export async function createTestingApp(): Promise<TestingAppContext> {
  const mockMailService = new MockMailService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('IMailService')
    .useValue(mockMailService)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Register production global pipes, interceptors, and filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new EnvelopeInterceptor());
  app.useGlobalFilters(new EnvelopeExceptionFilter());

  await app.init();

  return { app, mockMailService };
}
