import { Injectable, Inject, Logger } from '@nestjs/common';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';

@Injectable()
export class CleanExpiredOtpsUsecase {
  private readonly logger = new Logger(CleanExpiredOtpsUsecase.name);

  constructor(
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(): Promise<number> {
    this.logger.log('Executing expired OTP cleaner job...');
    const deletedCount = await this.otpRepository.deleteExpiredOtps();
    if (deletedCount > 0) {
      this.logger.log(`Successfully cleaned up ${deletedCount} expired OTPs from the database.`);
    }
    return deletedCount;
  }
}
