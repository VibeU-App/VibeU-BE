import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class LoginUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // 2. Verify password
    const isPasswordValid = await this.cryptoService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // 3. Check if user is verified
    if (!user.isVerified) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }

    // 4. Generate access and refresh tokens using TokenService
    const tokenPair = this.tokenService.createTokenPair(user.id, user.email, user.role);

    // 5. Save opaque refresh token session
    const session = SessionEntity.create({
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresInDays: 7,
    });
    await this.sessionRepository.save(session);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
