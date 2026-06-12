import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma/client';
import { config } from '../../../configuration';

/**
 * Prisma service for NestJS.
 * 
 * This service wraps PrismaClient and handles the database connection lifecycle.
 * It connects when the module initializes and disconnects when the module destroys.
 * 
 * The service uses Prisma's built-in connection pooling, which is more efficient
 * than managing connections manually.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      accelerateUrl: config.database.connectionString,
      // Log queries in development for debugging
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  /**
   * Called when the NestJS module initializes.
   * Connects to the database.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Called when the NestJS module destroys.
   * Disconnects from the database gracefully.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
