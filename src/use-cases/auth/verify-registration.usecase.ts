import { IUserRepository } from './user-repository.interface';
import { IOtpService } from '../../services/otp/otp.interface';

export interface VerifyRegistrationResult {
  message: string;
}

export class VerifyRegistrationUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
  ) {}

  async execute(email: string, otp: string): Promise<VerifyRegistrationResult> {
    throw new Error('Not implemented');
  }
}
