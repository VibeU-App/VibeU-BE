import { IUserRepository } from './user-repository.interface';
import { IOtpRepository } from './otp-repository.interface';

export interface VerifyRegistrationResult {
  message: string;
}

export class VerifyRegistrationUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(email: string, otp: string): Promise<VerifyRegistrationResult> {
    throw new Error('Not implemented');
  }
}
