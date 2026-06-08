import { IUserRepository } from './user-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

export class RegisterUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    throw new Error('Not implemented');
  }
}