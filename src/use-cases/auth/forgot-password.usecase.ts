import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { IPolicyRepository } from '../../core/abstracts/policy-repository.interface';
import { TemplateLoaderService } from '../../infrastructure/services/template/template-loader.service';
import { OtpEntity } from '../../core/entities';

export interface ForgotPasswordResult {
  message: string;
}

@Injectable()
export class ForgotPasswordUsecase {
  private readonly logger = new Logger(ForgotPasswordUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  async execute(email: string): Promise<ForgotPasswordResult> {
    const user = await this.userRepository.findByEmailOrRecoveryEmail(email);

    if (!!user) {
      const maxAttemptsVal = await this.policyRepository.findValueByKey('MAX_OTP_ATTEMPTS');
      const maxAttempts = maxAttemptsVal ? parseInt(maxAttemptsVal, 10) : 5;
      const expiryMinutesVal = await this.policyRepository.findValueByKey('OTP_EXPIRY_MINUTES');
      const expiryMinutes = expiryMinutesVal ? parseInt(expiryMinutesVal, 10) : 15;

      const otpObject = OtpEntity.create({
        userId: user.id,
        expiryMinutes,
        maxAttempts,
      });

      await this.otpRepository.save(otpObject);

      // Render template and send OTP
      const emailHtml = this.templateLoader.render('password-reset', {
        appName: 'VibeU',
        otp: otpObject.code,
        expiryMinutes,
      });
      this.mailService.send(email, 'Password Reset Code', emailHtml)
        .catch(err => this.logger.error(`Failed to send password reset email to ${email}: ${err.message}`, err.stack));
    } 

    return {
      message: "If that email is registered, an OTP has been sent."
    };

  }
}