import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import { config } from '../../configuration';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class LoginUsecase {
  private readonly logger = new Logger(LoginUsecase.name);

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
    this.logger.log(`User login attempt for email: ${email}`);

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${email}`);
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // 2. Verify password
    const isPasswordValid = await this.cryptoService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email ${email}`);
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // 3. Check if user is verified
    if (!user.isVerified) {
      this.logger.warn(`Login failed: User email ${email} is not verified`);
      throw new AppException(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }

    // 4. Generate access and refresh tokens using TokenService
    const tokenPair = this.tokenService.createTokenPair(user.id, user.email, user.role);

    // 5. Save opaque refresh token session
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenTtl * 1000);
    const session = SessionEntity.create({
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    this.logger.log(`User login successful for email: ${email}`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
