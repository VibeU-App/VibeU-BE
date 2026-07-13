import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/user-repository.impl';

/**
 * Global Prisma module.
 *
 * Making this module global allows any service to inject PrismaService
 * without importing the module explicitly. This is convenient for
 * database access throughout the application.
 *
 * Caching is handled at the database level using pg_prewarm extension.
 * The DatabasePrewarmService in postgres module calls pg_prewarm on startup
 * to load tables into PostgreSQL shared_buffers.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [PrismaService, 'IUserRepository'],
})
export class PrismaModule {}
