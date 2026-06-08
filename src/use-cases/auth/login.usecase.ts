import { IUserRepository } from './user-repository.interface';
import { IHashService } from './hash-service.interface';
import { IJwtService } from './jwt-service.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

export class LoginUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    throw new Error('Not implemented');
  }
}