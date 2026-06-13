import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaUserRepository } from './user.repository';
import { PrismaSessionRepository } from './session.repository';
import { AccountStatusLoaderService } from './account-status-loader.service';
import { DatabasePrewarmService } from './database-prewarm.service';
import { OtpCacheService } from '../../../services/otp/otp-cache.service';

/**
 * PostgreSQL module for NestJS.
 *
 * Exports only interfaces (tokens) - implementations are private to this module.
 * This follows the Dependency Inversion Principle:
 * - Use-cases depend on interfaces (tokens)
 * - Module provides concrete implementations
 *
 * Exported tokens:
 * - IUserRepository: User data access
 * - ISessionRepository: Session data access
 * - IOtpService: OTP generation and verification (in-memory cache)
 * - AccountStatusLoaderService: Account status lookups
 */
@Module({
  imports: [PrismaModule],
  providers: [
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
    'IOtpService',
    AccountStatusLoaderService,
    DatabasePrewarmService,
  ],
})
export class PostgresModule {}
