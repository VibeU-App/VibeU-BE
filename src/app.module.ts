import { Module } from '@nestjs/common';
import { PrismaModule } from './frameworks/database/prisma/prisma.module';
import { PostgresModule } from './frameworks/database/postgres/postgres.module';
import { ResetPasswordController } from './reset-password/reset-password.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    PrismaModule,
    PostgresModule,
  ],
  controllers: [ResetPasswordController, AuthController],
  providers: [],
})
export class AppModule {}
