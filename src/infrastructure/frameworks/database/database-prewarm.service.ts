import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Service that prewarms PostgreSQL tables on startup.
 */
@Injectable()
export class DatabasePrewarmService implements OnModuleInit {
  private readonly logger = new Logger(DatabasePrewarmService.name);

  // Tables to prewarm on startup (OTP is in-memory, not in DB)
  private readonly TABLES_TO_PREWARM = [
    'users',
    'account_statuses',
    'sessions',
    'policies',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called automatically when the NestJS module initializes.
   * Prewarms all configured tables.
   */
  async onModuleInit() {
    await this.prewarmTables();
  }

  /**
   * Calls pg_prewarm for each table to load data into shared buffers.
   */
  private async prewarmTables() {
    this.logger.log('Starting database prewarm...');

    for (const table of this.TABLES_TO_PREWARM) {
      try {
        const result = await this.prisma.$queryRawUnsafe<
          { pg_prewarm: number }[]
        >(`SELECT pg_prewarm(quote_ident('${table}')) as pg_prewarm`);

        const blocks = result[0]?.pg_prewarm ?? 0;
        this.logger.log(
          `Prewarmed table '${table}': ${blocks} blocks loaded into shared_buffers`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to prewarm table '${table}': ${error.message}. ` +
            `Make sure pg_prewarm extension is enabled: CREATE EXTENSION IF NOT EXISTS pg_prewarm;`,
        );
      }
    }

    this.logger.log('Database prewarm complete');
  }

  /**
   * Manually trigger prewarm for a specific table.
   */
  async prewarmTable(tableName: string): Promise<number> {
    try {
      const result = await this.prisma.$queryRawUnsafe<
        { pg_prewarm: number }[]
      >(`SELECT pg_prewarm(quote_ident('${tableName}')) as pg_prewarm`);

      const blocks = result[0]?.pg_prewarm ?? 0;
      this.logger.log(`Prewarmed table '${tableName}': ${blocks} blocks`);
      return blocks;
    } catch (error) {
      this.logger.error(
        `Failed to prewarm table '${tableName}': ${error.message}`,
      );
      throw error;
    }
  }
}
