import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient, AccountStatusName } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';

/**
 * Manages the Testcontainers PostgreSQL container lifecycle
 * and performs data cleanup for integration tests.
 */
export class TestDatabaseManager {
  private static container: StartedPostgreSqlContainer | null = null;
  private static prisma: PrismaClient | null = null;
  private static connectionUri: string = '';

  /**
   * Starts the PostgreSQL container, applies migrations/schema, and seeds baseline data.
   */
  static async start(): Promise<string> {
    if (this.container) {
      return this.connectionUri;
    }

    // 1. Boot up PostgreSQL container
    this.container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('vibeu_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    this.connectionUri = this.container.getConnectionUri();

    // 2. Set environment variables for the test process
    process.env.TEST_DATABASE_URL = this.connectionUri;
    process.env.DATABASE_URL = this.connectionUri;
    process.env.DIRECT_URL = this.connectionUri;

    // 3. Push schema to the test container database
    try {
      execSync(
        `pnpm prisma db push --accept-data-loss --url="${this.connectionUri}"`,
        {
          env: {
            ...process.env,
            DATABASE_URL: this.connectionUri,
            DIRECT_URL: this.connectionUri,
          },
          stdio: 'pipe',
        },
      );
    } catch (error: unknown) {
      console.error('Failed to push Prisma schema to test container:', error);
      throw error;
    }

    // 4. Create internal Prisma client
    const adapter = new PrismaPg({ connectionString: this.connectionUri });
    this.prisma = new PrismaClient({ adapter });
    await this.prisma.$connect();

    // 5. Seed essential lookup tables (account_statuses, policies)
    await this.seedBaselineData();

    return this.connectionUri;
  }

  /**
   * Seeds required baseline lookup records (statuses, policies) needed by services.
   */
  private static async seedBaselineData(): Promise<void> {
    if (!this.prisma) return;

    // Seed account statuses
    const statuses: AccountStatusName[] = [
      AccountStatusName.PENDING,
      AccountStatusName.ACTIVE,
      AccountStatusName.INACTIVE,
      AccountStatusName.TERMINATED,
    ];
    for (const status of statuses) {
      await this.prisma.accountStatus.upsert({
        where: { name: status },
        update: {},
        create: { name: status },
      });
    }

    // Seed required policies
    await this.prisma.policy.upsert({
      where: { key: 'MAX_OTP_ATTEMPTS' },
      update: {},
      create: { key: 'MAX_OTP_ATTEMPTS', value: '5' },
    });

    await this.prisma.policy.upsert({
      where: { key: 'OTP_EXPIRY_MINUTES' },
      update: {},
      create: { key: 'OTP_EXPIRY_MINUTES', value: '15' },
    });
  }

  /**
   * Properly cleans up all dynamic user/transactional tables between tests
   * while preserving static lookup tables (account_statuses, policies).
   */
  static async cleanData(): Promise<void> {
    if (!this.prisma) return;

    await this.prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "users", 
        "sessions", 
        "otps", 
        "profiles", 
        "photos", 
        "user_questionnaire_answers", 
        "profile_hobbies" 
      RESTART IDENTITY CASCADE;
    `);
  }

  /**
   * Stops the container and cleans up all database connections.
   */
  static async stop(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }

  /**
   * Returns the active test database connection URI.
   */
  static getConnectionUri(): string {
    return this.connectionUri;
  }

  /**
   * Returns the direct PrismaClient instance for assertions in tests.
   */
  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      throw new Error('TestDatabaseManager has not been started yet');
    }
    return this.prisma;
  }
}
