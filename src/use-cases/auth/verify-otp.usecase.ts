import { IOtpService } from '../../services/otp/otp.interface';
import { IJwtService } from '../../services/token/jwt.service';

export interface VerifyOtpResult {
  resetToken: string;
}

export class VerifyOtpUsecase {
  constructor(
    private readonly otpService: IOtpService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(email: string, otp: string): Promise<VerifyOtpResult> {
    throw new Error('Not implemented');
  }
}
