import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ISessionRepository } from './session-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { IMailService } from '../../infrastructure/services/mail/mail.interface';
import { IOtpService } from '../../infrastructure/services/otp/otp.interface';
import { ITokenService } from '../../infrastructure/services/token/token.service';
import { TemplateLoaderService } from '../../infrastructure/services/template/template-loader.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class RegisterUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }

    // 2. Hash password
    const passwordHash = await this.cryptoService.hash(password);

    // 3. Create user entity
    const user = UserEntity.create({
      email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    // 4. Generate and save OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = OtpEntity.create({
      userId: savedUser.id,
      code: otpCode,
      expiryMinutes: 10,
    });
    await this.otpService.save(otp);

    // 5. Render template and send verification email
    const emailHtml = this.templateLoader.render('otp-verification', {
      appName: 'VibeU',
      otp: otpCode,
      expiryMinutes: 10,
    });
    await this.mailService.send(savedUser.email, 'Your Verification Code', emailHtml);

    // 6. Generate access and refresh tokens using TokenService
    const tokenPair = this.tokenService.createTokenPair(savedUser.id, savedUser.email, savedUser.role);

    const session = SessionEntity.create({
      userId: savedUser.id,
      refreshToken: tokenPair.refreshToken,
      expiresInDays: 7,
    });
    await this.sessionRepository.save(session);

    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
