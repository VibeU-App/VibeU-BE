import { IOtpRepository } from './otp-repository.interface';
import { IJwtService } from '../../services/token/jwt.service';

export interface VerifyOtpResult {
  resetToken: string;
}

export class VerifyOtpUsecase {
  constructor(
    private readonly otpRepository: IOtpRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(email: string, otp: string): Promise<VerifyOtpResult> {
    throw new Error('Not implemented');
  }
}
