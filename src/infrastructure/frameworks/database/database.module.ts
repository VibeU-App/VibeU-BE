import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './user.repository';
import { PrismaSessionRepository } from './session.repository';
import { PrismaPolicyRepository } from './policy.repository';
import { AccountStatusLoaderService } from './account-status-loader.service';
import { DatabasePrewarmService } from './database-prewarm.service';
import { OtpCacheService } from '../../services/otp/otp-cache.service';

/**
 * Database module for VibeU.
 *
 * Consolidates repositories and database services under a single module.
 * Exports repository interfaces (tokens) to adhere to Dependency Inversion Principle.
 */
@Module({
  providers: [
    PrismaService,
    PrismaUserRepository,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    PrismaSessionRepository,
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    PrismaPolicyRepository,
    {
      provide: 'IPolicyRepository',
      useClass: PrismaPolicyRepository,
    },
    OtpCacheService,
    {
      provide: 'IOtpService',
      useClass: OtpCacheService,
    },
    AccountStatusLoaderService,
    DatabasePrewarmService,
  ],
  exports: [
    'IUserRepository',
    'ISessionRepository',
    'IPolicyRepository',
    'IOtpService',
    AccountStatusLoaderService,
    DatabasePrewarmService,
  ],
})
export class DatabaseModule {}
