import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/frameworks/database/database.module';
import { GlobalServicesModule } from './infrastructure/services/global-services.module';
import { AuthModule } from './controllers/auth.module';
import { SchedulingModule } from './infrastructure/schedulers/scheduling.module';
import { ProfileModule } from './controllers/profile.module';

@Module({
  imports: [
    DatabaseModule,
    GlobalServicesModule,
    AuthModule,
    SchedulingModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
