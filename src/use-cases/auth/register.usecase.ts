import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ISessionRepository } from '../../core/abstracts/session-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { IPolicyRepository } from '../../core/abstracts/policy-repository.interface';
import { TemplateLoaderService } from '../../infrastructure/services/template/template-loader.service';
import { UserEntity, AccountStatusName } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import { config } from '../../configuration';

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class RegisterUsecase {
  private readonly logger = new Logger(RegisterUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    this.logger.log(`User registration attempt for email: ${email}`);

    // 1. Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    const pendingStatusId = await this.userRepository.findStatusByName(AccountStatusName.PENDING);
    if (!pendingStatusId) {
      throw new Error('Pending account status not found in system');
    }

    let savedUser: UserEntity;

    if (existingUser) {
      if (existingUser.accountStatusId !== pendingStatusId) {
        this.logger.warn(`Registration rejected. Email already exists and is active: ${email}`);
        throw new AppException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
      }

      this.logger.log(`Email ${email} has pending registration. Overwriting password and sending new OTP.`);
      // Hash password and update existing user (overwriting password for pending registration)
      const passwordHash = await this.cryptoService.hash(password);
      const updatedUser = new UserEntity(
        existingUser.id,
        existingUser.email,
        passwordHash,
        existingUser.accountStatusId,
        existingUser.role,
        existingUser.isVerified,
        existingUser.createdAt,
        new Date(),
        existingUser.deletedAt,
      );
      savedUser = await this.userRepository.update(updatedUser);
    } else {
      // 2. Hash password and create new user
      const passwordHash = await this.cryptoService.hash(password);
      const user = UserEntity.create({
        email,
        passwordHash,
        accountStatusId: pendingStatusId,
      });
      savedUser = await this.userRepository.save(user);
    }

    // 4. Generate and save OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const maxAttemptsVal = await this.policyRepository.findValueByKey('MAX_OTP_ATTEMPTS');
    const maxAttempts = maxAttemptsVal ? parseInt(maxAttemptsVal, 10) : 5;

    const otp = OtpEntity.create({
      userId: savedUser.id,
      code: otpCode,
      expiryMinutes: 10,
      maxAttempts,
    });
    await this.otpRepository.save(otp);

    // 5. Render template and send verification email
    const emailHtml = this.templateLoader.render('otp-verification', {
      appName: 'VibeU',
      otp: otpCode,
      expiryMinutes: 10,
    });
    await this.mailService.send(savedUser.email, 'Your Verification Code', emailHtml);

    // 6. Generate access and refresh tokens using TokenService
    const tokenPair = this.tokenService.createTokenPair(savedUser.id, savedUser.email, savedUser.role);

    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenTtl * 1000);
    const session = SessionEntity.create({
      userId: savedUser.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    this.logger.log(`User registration process completed successfully for: ${email}`);

    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
