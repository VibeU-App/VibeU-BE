import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ISessionRepository } from './session-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IJwtService } from '../../services/token/jwt.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import * as crypto from 'crypto';

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
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
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

    // 4. Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.signPayload(payload);

    // 5. Generate and save opaque refresh token session
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const session = SessionEntity.create({
      userId: user.id,
      refreshToken,
      expiresInDays: 7,
    });
    await this.sessionRepository.save(session);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
