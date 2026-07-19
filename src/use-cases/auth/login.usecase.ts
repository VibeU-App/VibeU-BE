import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import { config } from '../../configuration';
import { LoginType } from '../../core/dtos/auth/login.dto';

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
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(email: string, credentials: { type?: LoginType; password?: string; otp?: string }): Promise<LoginResult> {
    this.logger.log(`User login attempt for email: ${email}`);

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${email}`);
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    // 2. Select login mechanism (default to PASSWORD if type is not specified or if password is provided)
    const loginType = credentials.type ?? (credentials.otp ? LoginType.OTP : LoginType.PASSWORD);

    if (loginType === LoginType.OTP) {
      // Passwordless Verification Logic
      if (!credentials.otp) {
        throw new AppException(ErrorCode.AUTH_OTP_INVALID, undefined, 'OTP is required');
      }

      const otp = await this.otpRepository.findByUserId(user.id);
      if (!otp) {
        throw new AppException(ErrorCode.AUTH_OTP_INVALID);
      }

      if (otp.code !== credentials.otp) {
        await this.otpRepository.incrementAttempts(user.id);
        throw new AppException(ErrorCode.AUTH_OTP_INVALID);
      }

      if (otp.isExpired()) {
        await this.otpRepository.deleteByUserId(user.id);
        throw new AppException(ErrorCode.AUTH_OTP_EXPIRED);
      }

      if (otp.isMaxAttemptsReached()) {
        await this.otpRepository.deleteByUserId(user.id);
        throw new AppException(ErrorCode.AUTH_OTP_INVALID);
      }

      // Delete verified OTP
      await this.otpRepository.deleteByUserId(user.id);
    } else {
      // Traditional Password Verification Logic
      if (!credentials.password) {
        throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, 'Password is required');
      }

      const isPasswordValid = await this.cryptoService.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for email ${email}`);
        throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
      }
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
