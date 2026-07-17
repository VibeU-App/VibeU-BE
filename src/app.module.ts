import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/frameworks/database/prisma/prisma.module';
import { PostgresModule } from './infrastructure/frameworks/database/postgres/postgres.module';
import { GlobalServicesModule } from './infrastructure/global-services.module';
import { AuthModule } from './controllers/auth.module';

@Module({
  imports: [
    PrismaModule,
    PostgresModule,
    GlobalServicesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
