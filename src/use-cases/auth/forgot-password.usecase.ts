import { IUserRepository } from './user-repository.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpService } from '../../services/otp/otp.interface';
import { randomBytes } from 'crypto';
import { OtpEntity } from '../../core/entities';

export interface OtpResult {
  message: string;
}

export class ForgotPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly otpService: IOtpService,
  ) {}

  async execute(email: string): Promise<OtpResult> {
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

      this.otpService.save(otpObject);
      this.mailService.sendPasswordResetOtp(email, otpCode);
    } 

    return {
      message: "If that email is registered, an OTP has been sent."
    };

  }
}
