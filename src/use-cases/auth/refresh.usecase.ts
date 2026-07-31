import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { config } from '../../configuration';
import { SessionEntity } from '../../core/entities/session.entity';
import { UserEntity } from '../../core/entities/user.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class RefreshUsecase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshResult> {
    // 1. Find session by refresh token
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }

    // 2. Check if expired
    if (session.isExpired() || session.deletedAt !== null) {
      // Invalidate the session (soft delete)
      const invalidatedSession = new SessionEntity(
        session.id,
        session.userId,
        session.refreshToken,
        session.expiresAt,
        session.createdAt,
        session.updatedAt,
        new Date(), // Soft delete now
      );
      await this.sessionRepository.update(invalidatedSession);
      throw new AppException(ErrorCode.AUTH_SESSION_EXPIRED);
    }

    // 3. Find user
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // 4. Generate new token pair
    const tokenPair = this.tokenService.createTokenPair(
      user.id,
      user.email,
      user.role,
    );

    // 5. Update session with new refresh token and extend expiration
    const newExpiresAt = new Date(
      Date.now() + config.jwt.refreshTokenTtl * 1000,
    );

    const updatedSession = new SessionEntity(
      session.id,
      session.userId,
      tokenPair.refreshToken,
      newExpiresAt,
      session.createdAt,
      new Date(),
      session.deletedAt,
    );
    await this.sessionRepository.update(updatedSession);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
