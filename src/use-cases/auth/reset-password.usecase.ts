import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';

export interface ResetPasswordResult {
  message: string;
}

export class ResetPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(email: string, newPassword: string): Promise<ResetPasswordResult> {
    throw new Error('Not implemented');
  }
}
