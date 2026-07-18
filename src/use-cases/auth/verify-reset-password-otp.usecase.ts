import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { IJwtService } from '../../infrastructure/services/token/jwt.service';
import { UserRole } from '../../core/entities';
import { ErrorCode } from '../../core/errors';

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

  async execute(email: string, otp: string): Promise<VerifyResetPasswordOtpResult> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!!user) {
      const userOtp = await this.otpRepository.findByUserId(user.id);
      console.log('userOtp:', userOtp); // Debugging line to check the value of userOtp
      if (!!userOtp) {
        if (userOtp.code !== otp) {
          await this.otpRepository.incrementAttempts(user.id);
          throw new BadRequestException({
            code: ErrorCode.AUTH_OTP_INVALID,
            message: "Invalid OTP",
          });
        }

        if (userOtp.isMaxAttemptsReached()) {
          throw new BadRequestException({
            code: ErrorCode.AUTH_OTP_INVALID,
            message: "Invalid OTP",
          });
        }

        if (userOtp.isExpired()) {
          throw new BadRequestException({
            code: ErrorCode.AUTH_OTP_EXPIRED,
            message: "Expired OTP",
          });
        }

        await this.otpRepository.deleteByUserId(user.id);
        const payload = {
          sub: user.id,
          email: user.email,
          role: UserRole.USER,
          purpose: "password_reset",
        }

        return {
          resetToken: this.jwtService.signPayload(payload),
        }
      }
    }
  

    throw new BadRequestException({
      code: ErrorCode.AUTH_USER_NOT_FOUND,
      message: "User not found",
    });
  }
}
