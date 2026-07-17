import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ISessionRepository } from './session-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpService } from '../../services/otp/otp.interface';
import { IJwtService } from '../../services/token/jwt.service';
import { UserEntity } from '../../core/entities/user.entity';
import { SessionEntity } from '../../core/entities/session.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import * as crypto from 'crypto';

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
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
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

    // 5. Send verification email
    await this.mailService.sendOtp(savedUser.email, otpCode);

    // 6. Generate access and refresh tokens
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = this.jwtService.signPayload(payload);

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const session = SessionEntity.create({
      userId: savedUser.id,
      refreshToken,
      expiresInDays: 7,
    });
    await this.sessionRepository.save(session);

    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
