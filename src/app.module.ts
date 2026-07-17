import { Module } from '@nestjs/common';
import { PrismaModule } from './frameworks/database/prisma/prisma.module';
import { PostgresModule } from './frameworks/database/postgres/postgres.module';
import { AuthModule } from './controllers/auth.module';

@Module({
  imports: [
    PrismaModule,
    PostgresModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
