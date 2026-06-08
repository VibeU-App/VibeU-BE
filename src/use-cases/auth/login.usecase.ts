import { IUserRepository } from './user-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

export class LoginUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    throw new Error('Not implemented');
  }
}