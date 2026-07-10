import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IJwtService } from '../../services/token/jwt.service';
import { UserEntity } from '../../core/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

export class LoginUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: ICryptoService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    throw new Error('Not implemented');
  }
}
