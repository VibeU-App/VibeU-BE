import { Module } from '@nestjs/common';
import { PrismaModule } from './frameworks/database/prisma/prisma.module';
import { PostgresModule } from './frameworks/database/postgres/postgres.module';

@Module({
  imports: [
    PrismaModule,
    PostgresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
