import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaUserRepository } from './user.repository';
import { CachedUserRepository } from './cached-user.repository';
import { PrismaSessionRepository } from './session.repository';
import { AccountStatusLoaderService } from './account-status-loader.service';

/**
 * PostgreSQL module for NestJS.
 *
 * This module provides the repository implementations that connect
 * to PostgreSQL via Prisma. It imports PrismaModule to get access
 * to PrismaService.
 *
 * Repository implementations:
 * - PrismaUserRepository: Direct Prisma queries
 * - CachedUserRepository: Adds in-memory caching on top of Prisma
 * - PrismaSessionRepository: Manages refresh tokens
 *
 * Services:
 * - AccountStatusLoaderService: Loads account statuses into memory at startup
 */
@Module({
  imports: [PrismaModule],
  providers: [
    PrismaUserRepository,
    {
      provide: 'IUserRepository',
      useClass: CachedUserRepository,
    },
    PrismaSessionRepository,
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    AccountStatusLoaderService,
  ],
  exports: [
    'IUserRepository',
    PrismaUserRepository,
    'ISessionRepository',
    PrismaSessionRepository,
    AccountStatusLoaderService,
  ],
})
export class PostgresModule {}
