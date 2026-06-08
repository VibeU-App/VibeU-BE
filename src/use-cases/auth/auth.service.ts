import { IUserRepository } from './user-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  // TODO: Implement registration logic
  async register(email: string, password: string): Promise<RegisterResult> {
    throw new Error('Not implemented');
  }

  // TODO: Implement login logic
  async login(email: string, password: string): Promise<LoginResult> {
    throw new Error('Not implemented');
  }

  // TODO: Implement token validation
  async validateToken(token: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    throw new Error('Not implemented');
  }
}