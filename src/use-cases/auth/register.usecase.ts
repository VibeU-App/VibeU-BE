import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpService } from '../../services/otp/otp.interface';
import { UserEntity } from '../../core/entities/user.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class RegisterUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }

    // 2. Hash password
    const passwordHash = await this.cryptoService.hash(password);

    // 3. Create user entity (Note: accountStatusId will be set in repository or here)
    // For now, let's assume the repository handles default status or we need to find PENDING status id.
    // In a real scenario, we might have a constant or lookup for PENDING status.
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

    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return {
      user: userWithoutPassword as Omit<UserEntity, 'passwordHash'>,
    };
  }
}
