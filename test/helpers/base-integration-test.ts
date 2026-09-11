import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { TestDatabaseManager } from './test-database.manager';
import { createTestingApp, MockMailService } from './create-testing-app';

export interface AuthenticatedUserSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
}

/**
 * Base class for all integration tests using Testcontainers.
 * Automatically handles container startup, database migrations/seeds,
 * NestJS app initialization, and per-test transactional cleanup.
 *
 * Child test suites can inherit from this class to obtain full access
 * to the container database, NestJS application, mock mail service, and helper utilities.
 */
export abstract class BaseIntegrationTest {
  public app!: INestApplication;
  public prisma!: PrismaClient;
  public mockMailService!: MockMailService;

  constructor() {
    this.registerLifecycleHooks();
  }

  /**
   * Registers Jest lifecycle hooks for the enclosing describe block.
   */
  private registerLifecycleHooks(): void {
    beforeAll(async () => {
      // 1. Start PostgreSQL container & run schema migrations/baseline seeds
      await TestDatabaseManager.start();
      this.prisma = TestDatabaseManager.getPrisma();

      // 2. Boot up NestJS application with container DB
      const context = await createTestingApp();
      this.app = context.app;
      this.mockMailService = context.mockMailService;

      // 3. Subclass setup hook
      await this.onSetup();
    }, 180000);

    afterEach(async () => {
      // Clean up transactional and user data between tests
      await TestDatabaseManager.cleanData();
      this.mockMailService?.clear();

      // Subclass cleanup hook
      await this.onCleanup();
    });

    afterAll(async () => {
      // Subclass teardown hook
      await this.onTeardown();

      // Close application and stop container
      if (this.app) {
        await this.app.close();
      }
      await TestDatabaseManager.stop();
    });
  }

  /**
   * Convenience getter for supertest HTTP server instance.
   */

  get httpServer(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.app.getHttpServer();
  }

  /**
   * Optional lifecycle hook executed in `beforeAll` after container and app are initialized.
   * Can be overridden by subclasses to seed custom data or configure module dependencies.
   */
  protected async onSetup(): Promise<void> {}

  /**
   * Optional lifecycle hook executed in `afterEach` after standard data cleanup.
   */
  protected async onCleanup(): Promise<void> {}

  /**
   * Optional lifecycle hook executed in `afterAll` before the app and container shut down.
   */
  protected async onTeardown(): Promise<void> {}

  /**
   * Helper to register and verify a user, returning valid authentication tokens.
   * Useful for child test suites needing authenticated sessions (e.g., Me, Posts, Profiling).
   */
  public async createAuthenticatedUser(
    email: string = 'testuser@university.edu',
  ): Promise<AuthenticatedUserSession> {
    await request(this.httpServer)
      .post('/auth/register')
      .send({ email })
      .expect(201);

    const otp = this.mockMailService.getLatestOtpFor(email);
    if (!otp) {
      throw new Error(`Failed to retrieve registration OTP for ${email}`);
    }

    const response = await request(this.httpServer)
      .post('/auth/verify-registration')
      .send({ email, otp })
      .expect(200);

    return response.body.data as AuthenticatedUserSession;
  }
}
