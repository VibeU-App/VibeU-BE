import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { IPolicyRepository } from '../../core/abstracts/policy-repository.interface';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { TemplateLoaderService } from '../../infrastructure/services/template/template-loader.service';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

@Injectable()
export class RequestLoginOtpUsecase {
  private readonly logger = new Logger(RequestLoginOtpUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    this.logger.log(`Request login OTP attempt for email: ${email}`);

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(
        `Login OTP request failed: User not found for email ${email}`,
      );
      throw new AppException(
        ErrorCode.AUTH_USER_NOT_FOUND,
        undefined,
        'User not found',
      );
    }

    // 2. Check if verified
    if (!user.isVerified) {
      this.logger.warn(
        `Login OTP request failed: User email ${email} is not verified`,
      );
      throw new AppException(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }

    // 3. Generate and save OTP
    const maxAttemptsVal =
      await this.policyRepository.findValueByKey('MAX_OTP_ATTEMPTS');
    const maxAttempts = maxAttemptsVal ? parseInt(maxAttemptsVal, 10) : 5;
    const expiryMinutesVal =
      await this.policyRepository.findValueByKey('OTP_EXPIRY_MINUTES');
    const expiryMinutes = expiryMinutesVal
      ? parseInt(expiryMinutesVal, 10)
      : 15;

    // Delete any existing OTP first to avoid duplicates/conflicts
    await this.otpRepository.deleteByUserId(user.id);

    const otp = OtpEntity.create({
      userId: user.id,
      expiryMinutes,
      maxAttempts,
    });
    await this.otpRepository.save(otp);

    // 4. Render template and send login OTP email
    const emailHtml = this.templateLoader.render('otp-verification', {
      appName: 'VibeU',
      otp: otp.code,
      expiryMinutes,
    });
    this.mailService
      .send(user.email, 'Your Login Verification Code', emailHtml)
      .catch((err) =>
        this.logger.error(
          `Failed to send login verification email to ${user.email}: ${err.message}`,
          err.stack,
        ),
      );

    this.logger.log(`Login OTP successfully sent to: ${email}`);

    return {
      message: 'OTP has been sent to your email.',
    };
  }
}
