import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/frameworks/database/database.module';
import { GlobalServicesModule } from './infrastructure/services/global-services.module';
import { AuthModule } from './controllers/auth.module';

@Module({
  imports: [
    DatabaseModule,
    GlobalServicesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
