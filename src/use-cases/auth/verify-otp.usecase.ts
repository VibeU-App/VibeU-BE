import { IUserRepository } from './user-repository.interface';
import { IOtpService } from '../../services/otp/otp.interface';
import { IJwtService } from '../../services/token/jwt.service';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../../core/entities';
import { ErrorCode } from '../../core/errors';

export interface VerifyOtpResult {
  resetToken: string;
}

@Injectable()
export class VerifyOtpUsecase {
  constructor(
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string, otp: string): Promise<VerifyOtpResult> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!!user) {
      const userOtp = await this.otpService.findByUserId(user.id);

      if (!!userOtp) {
        if (userOtp.code !== otp) {
          this.otpService.incrementAttempts(user.id);
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

        await this.otpService.deleteByUserId(user.id);
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
