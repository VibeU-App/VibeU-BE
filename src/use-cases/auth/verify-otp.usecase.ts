import { Injectable, Inject } from '@nestjs/common';
import { IOtpService } from '../../services/otp/otp.interface';
import { IJwtService } from '../../services/token/jwt.service';

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
  ) {}

  async execute(email: string, otp: string): Promise<VerifyOtpResult> {
    throw new Error('Not implemented');
  }
}
