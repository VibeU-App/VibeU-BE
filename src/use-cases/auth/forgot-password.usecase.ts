import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { IOtpService } from '../../infrastructure/services/otp/otp.interface';
import { TemplateLoaderService } from '../../infrastructure/services/template/template-loader.service';
import { randomBytes } from 'crypto';
import { OtpEntity } from '../../core/entities';

export interface ForgotPasswordResult {
  message: string;
}

@Injectable()
export class ForgotPasswordUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  async execute(email: string): Promise<ForgotPasswordResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!!user) {
      const buffer = randomBytes(4);
      const rawOtp = buffer.readUInt32BE(0) % 1000000;
      const otpCode = rawOtp.toString().padStart(6, '0');
      const VALID_DURATION = 5 * 60 * 1000 // 5 minutes
      const otpObject: OtpEntity = new OtpEntity(
        user.id,
        otpCode,
        new Date(Date.now() + VALID_DURATION),
        new Date(Date.now()),
      )

      await this.otpService.save(otpObject);

      // Render template and send OTP
      const emailHtml = this.templateLoader.render('password-reset', {
        appName: 'VibeU',
        otp: otpCode,
        expiryMinutes: 5,
      });
      await this.mailService.send(email, 'Password Reset Code', emailHtml);
    } 

    return {
      message: "If that email is registered, an OTP has been sent."
    };

  }
}