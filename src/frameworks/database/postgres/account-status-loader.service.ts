import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatusEntity, AccountStatusName } from '../../../core/entities/user.entity';

/**
 * Service that loads account statuses into memory at startup.
 *
 * Instead of querying the database every time we need to check an account status,
 * we load all statuses into a HashMap once when the server starts.
 * This provides O(1) lookups by name or ID.
 *
 * Why this approach:
 * - Account statuses are a small, fixed lookup table (PENDING, ACTIVE, INACTIVE, TERMINATED)
 * - They rarely change (only via migrations)
 * - Frequent lookups during auth flows would add unnecessary DB queries
 *
 * Usage:
 *   const status = accountStatusLoader.getByName(AccountStatusName.ACTIVE);
 *   const status = accountStatusLoader.getById('some-uuid');
 */
@Injectable()
export class AccountStatusLoaderService implements OnModuleInit {
  private readonly logger = new Logger(AccountStatusLoaderService.name);

  // Two indexes for O(1) lookup by either name or ID
  private statusByName = new Map<AccountStatusName, AccountStatusEntity>();
  private statusById = new Map<string, AccountStatusEntity>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called automatically when the NestJS module initializes.
   * Loads all account statuses from the database into memory.
   */
  async onModuleInit() {
    await this.loadStatuses();
  }

  /**
   * Fetches all account statuses from DB and indexes them in memory.
   * Logs each loaded status for debugging.
   */
  private async loadStatuses() {
    const statuses = await this.prisma.accountStatus.findMany();

    for (const status of statuses) {
      const entity = new AccountStatusEntity(
        status.id,
        status.name as AccountStatusName,
        status.createdAt,
        status.updatedAt,
      );

      this.statusByName.set(entity.name, entity);
      this.statusById.set(entity.id, entity);

      this.logger.log(`Loaded account status: ${entity.name} (${entity.id})`);
    }

    this.logger.log(`Loaded ${statuses.length} account statuses into memory`);
  }

  /**
   * Gets an account status by its name (PENDING, ACTIVE, etc.).
   * Returns null if not found.
   */
  getByName(name: AccountStatusName): AccountStatusEntity | null {
    return this.statusByName.get(name) ?? null;
  }

  /**
   * Gets an account status by its UUID.
   * Returns null if not found.
   */
  getById(id: string): AccountStatusEntity | null {
    return this.statusById.get(id) ?? null;
  }

  /**
   * Gets the ID for a status name.
   * Convenience method to avoid null checks when you just need the ID.
   * Throws if the status doesn't exist (should never happen if DB is seeded).
   */
  getStatusId(name: AccountStatusName): string {
    const status = this.statusByName.get(name);
    if (!status) {
      throw new Error(`Account status '${name}' not found. Was the database seeded?`);
    }
    return status.id;
  }
}
