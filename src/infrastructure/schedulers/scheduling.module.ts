import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OtpCleanerScheduler } from './otp-cleaner.scheduler';
import { AuthModule } from '../../controllers/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  providers: [OtpCleanerScheduler],
  exports: [OtpCleanerScheduler],
})
export class SchedulingModule {}
