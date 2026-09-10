import { Injectable, Inject } from '@nestjs/common';
import {
  IUserRepository,
  IOtpRepository,
  IJwtService,
} from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core/errors';

export interface VerifyResetPasswordOtpResult {
  resetToken: string;
}

@Injectable()
export class VerifyResetPasswordOtpUsecase {
  constructor(
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    email: string,
    otp: string,
  ): Promise<VerifyResetPasswordOtpResult> {
    const user = await this.userRepository.findByEmailOrRecoveryEmail(email);

    if (user) {
      const userOtp = await this.otpRepository.findByUserId(user.id);
      if (userOtp) {
        if (userOtp.isExpired()) {
          await this.otpRepository.deleteByUserId(user.id);
          throw new AppException(ErrorCode.AUTH_OTP_EXPIRED);
        }

        if (userOtp.isMaxAttemptsReached()) {
          await this.otpRepository.deleteByUserId(user.id);
          throw new AppException(ErrorCode.AUTH_OTP_INVALID);
        }

        if (userOtp.code !== otp) {
          await this.otpRepository.incrementAttempts(user.id);
          throw new AppException(ErrorCode.AUTH_OTP_INVALID);
        }

        await this.otpRepository.deleteByUserId(user.id);
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          purpose: 'password_reset',
          hash: user.passwordHash,
        };

        return {
          resetToken: this.jwtService.signPayload(payload),
        };
      }
    }

    throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
  }
}
