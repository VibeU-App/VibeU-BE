import { IUserRepository } from './user-repository.interface';
import { IHashService } from './hash-service.interface';

export interface ResetPasswordResult {
  message: string;
}

export class ResetPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(email: string, newPassword: string): Promise<ResetPasswordResult> {
    throw new Error('Not implemented');
  }
}