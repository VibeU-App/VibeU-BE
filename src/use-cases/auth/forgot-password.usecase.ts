import { IUserRepository } from './user-repository.interface';

export interface OtpResult {
  message: string;
}

export class ForgotPasswordUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<OtpResult> {
    throw new Error('Not implemented');
  }
}