import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global Prisma module.
 * 
 * Making this module global allows any service to inject PrismaService
 * without importing the module explicitly. This is convenient for
 * database access throughout the application.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
