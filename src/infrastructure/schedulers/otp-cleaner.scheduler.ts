import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanExpiredOtpsUsecase } from '../../use-cases/auth/clean-expired-otps.usecase';

@Injectable()
export class OtpCleanerScheduler {
  private readonly logger = new Logger(OtpCleanerScheduler.name);

  constructor(
    private readonly cleanExpiredOtpsUsecase: CleanExpiredOtpsUsecase,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('Triggering scheduled task: expired OTP cleaner...');
    try {
      await this.cleanExpiredOtpsUsecase.execute();
    } catch (error) {
      this.logger.error(
        'Failed to run scheduled expired OTP cleaner job:',
        error,
      );
    }
  }
}
