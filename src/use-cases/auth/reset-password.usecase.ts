import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';

export interface ResetPasswordResult {
  message: string;
}

@Injectable()
export class ResetPasswordUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(token: string, password: string): Promise<ResetPasswordResult> {
    throw new Error('Not implemented');
  }
}
