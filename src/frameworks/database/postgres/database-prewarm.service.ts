import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service that prewarms PostgreSQL tables on startup.
 *
 * Uses Supabase's pg_prewarm extension to load table data into
 * PostgreSQL's shared buffers (RAM). This reduces cold-start
 * latency for frequently accessed tables.
 *
 * How it works:
 * 1. On server start, calls pg_prewarm for each important table
 * 2. PostgreSQL loads the table pages into shared_buffers
 * 3. Subsequent queries read from RAM instead of disk
 *
 * Tables to prewarm:
 * - users: Frequently accessed during auth flows
 * - account_statuses: Small lookup table, always in memory
 * - sessions: Accessed on every authenticated request
 * - otps: Accessed during verification flows
 *
 * Setup in Supabase:
 * 1. Enable extension: CREATE EXTENSION IF NOT EXISTS pg_prewarm;
 * 2. The extension is already available in Supabase projects
 *
 * Note: pg_prewarm loads data into shared_buffers which is managed
 * by PostgreSQL's LRU cache. Data may be evicted if memory pressure
 * is high, but frequently accessed data will stay warm.
 */
@Injectable()
export class DatabasePrewarmService implements OnModuleInit {
  private readonly logger = new Logger(DatabasePrewarmService.name);

  // Tables to prewarm on startup (OTP is in-memory, not in DB)
  private readonly TABLES_TO_PREWARM = [
    'users',
    'account_statuses',
    'sessions',
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
   *
   * pg_prewarm signature: pg_prewarm(regclass, mode text, fork text, first_block int, last_block int)
   * - regclass: Table name or OID
   * - mode: 'buffer' (default), 'read', or 'prefetch'
   * - fork: 'main' (default), 'fsm', or 'vm'
   *
   * We use default mode (buffer) which loads pages into shared_buffers.
   *
   * Note: Using quote_ident() to safely escape table names and prevent SQL injection.
   */
  private async prewarmTables() {
    this.logger.log('Starting database prewarm...');

    for (const table of this.TABLES_TO_PREWARM) {
      try {
        // Use quote_ident to safely escape table name
        const result = await this.prisma.$queryRawUnsafe<{ pg_prewarm: number }[]>(
          `SELECT pg_prewarm(quote_ident('${table}')) as pg_prewarm`
        );

        const blocks = result[0]?.pg_prewarm ?? 0;
        this.logger.log(`Prewarmed table '${table}': ${blocks} blocks loaded into shared_buffers`);
      } catch (error) {
        // Don't fail startup if prewarm fails
        // This can happen if:
        // - pg_prewarm extension is not enabled
        // - Table doesn't exist yet
        // - Permission issues
        this.logger.warn(
          `Failed to prewarm table '${table}': ${error.message}. ` +
          `Make sure pg_prewarm extension is enabled: CREATE EXTENSION IF NOT EXISTS pg_prewarm;`
        );
      }
    }

    this.logger.log('Database prewarm complete');
  }

  /**
   * Manually trigger prewarm for a specific table.
   * Useful for re-warming after bulk data loads.
   */
  async prewarmTable(tableName: string): Promise<number> {
    try {
      const result = await this.prisma.$queryRawUnsafe<{ pg_prewarm: number }[]>(
        `SELECT pg_prewarm(quote_ident('${tableName}')) as pg_prewarm`
      );

      const blocks = result[0]?.pg_prewarm ?? 0;
      this.logger.log(`Prewarmed table '${tableName}': ${blocks} blocks`);
      return blocks;
    } catch (error) {
      this.logger.error(`Failed to prewarm table '${tableName}': ${error.message}`);
      throw error;
    }
  }
}
