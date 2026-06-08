import { IUserRepository } from './user-repository.interface';

export interface VerifyOtpResult {
  resetToken: string;
}

export class VerifyOtpUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, otp: string): Promise<VerifyOtpResult> {
    throw new Error('Not implemented');
  }
}