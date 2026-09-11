import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../../../configuration';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString =
      process.env.TEST_DATABASE_URL ||
      process.env.DATABASE_URL ||
      config.database.connectionString;

    const adapter = new PrismaPg({
      connectionString,
    });
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  private getSanitizedDbInfo(): {
    host: string;
    port: string;
    database: string;
    provider: string;
    isPooler: boolean;
    user: string;
  } {
    try {
      const connStr =
        process.env.TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        config.database.connectionString;
      const url = new URL(connStr);
      const isSupabase = url.hostname.includes('supabase');
      const isPooler =
        url.searchParams.get('pgbouncer') === 'true' || url.port === '6543';

      return {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.replace(/^\//, ''),
        provider: isSupabase ? 'Supabase' : 'PostgreSQL',
        isPooler,
        user: url.username ? `${url.username.substring(0, 12)}***` : 'unknown',
      };
    } catch {
      return {
        host: 'unknown',
        port: 'unknown',
        database: 'unknown',
        provider: 'PostgreSQL',
        isPooler: false,
        user: 'unknown',
      };
    }
  }

  async onModuleInit() {
    const info = this.getSanitizedDbInfo();
    this.logger.log(
      `Connecting to database [${info.provider}] at ${info.host}:${info.port}/${info.database} (User: ${info.user}, Mode: ${info.isPooler ? 'PgBouncer Pooler' : 'Direct Connection'})...`,
    );

    const start = Date.now();
    try {
      await this.$connect();
      // Test ping
      await this.$queryRawUnsafe('SELECT 1');
      const latencyMs = Date.now() - start;
      this.logger.log(
        `Database connection established in ${latencyMs}ms -> [${info.provider}] ${info.host}:${info.port}/${info.database}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to database at ${info.host}:${info.port}/${info.database}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    const info = this.getSanitizedDbInfo();
    this.logger.log(
      `Disconnecting from database [${info.provider}] ${info.host}:${info.port}/${info.database} gracefully...`,
    );
    await this.$disconnect();
    this.logger.log('Database connection closed successfully.');
  }
}
