import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IUserRepository,
  IMailService,
  IOtpRepository,
  IPolicyRepository,
  ITemplateLoaderService,
} from '../../core/abstracts';
import { UserEntity, AccountStatusName } from '../../core/entities/user.entity';
import { OtpEntity } from '../../core/entities/otp.entity';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';

@Injectable()
export class RegisterUsecase {
  private readonly logger = new Logger(RegisterUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
    @Inject('ITemplateLoaderService')
    private readonly templateLoader: ITemplateLoaderService,
  ) {}

  async execute(email: string): Promise<void> {
    this.logger.log(`User registration attempt for email: ${email}`);

    // 1. Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    const pendingStatusId = await this.userRepository.findStatusByName(
      AccountStatusName.PENDING,
    );
    if (!pendingStatusId) {
      throw new Error('Pending account status not found in system');
    }

    let savedUser: UserEntity;

    if (existingUser) {
      if (existingUser.accountStatusId !== pendingStatusId) {
        this.logger.warn(
          `Registration rejected. Email already exists and is active: ${email}`,
        );
        throw new AppException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
      }

      this.logger.log(
        `Email ${email} has pending registration. Sending new OTP.`,
      );
      // Update existing user metadata, keeping empty/existing password until verified
      const updatedUser = new UserEntity(
        existingUser.id,
        existingUser.email,
        existingUser.passwordHash,
        existingUser.accountStatusId,
        existingUser.role,
        existingUser.isVerified,
        existingUser.createdAt,
        new Date(),
        existingUser.deletedAt,
        existingUser.recoveryEmail,
      );
      savedUser = await this.userRepository.update(updatedUser);
    } else {
      // 2. Create new user with empty password (user will choose password during OTP verification)
      const user = UserEntity.create({
        email,
        passwordHash: '',
        accountStatusId: pendingStatusId,
      });
      savedUser = await this.userRepository.save(user);
    }

    // 3. Generate and save OTP
    const maxAttemptsVal =
      await this.policyRepository.findValueByKey('MAX_OTP_ATTEMPTS');
    const maxAttempts = maxAttemptsVal ? parseInt(maxAttemptsVal, 10) : 5;
    const expiryMinutesVal =
      await this.policyRepository.findValueByKey('OTP_EXPIRY_MINUTES');
    const expiryMinutes = expiryMinutesVal
      ? parseInt(expiryMinutesVal, 10)
      : 15;

    const otp = OtpEntity.create({
      userId: savedUser.id,
      expiryMinutes,
      maxAttempts,
    });
    await this.otpRepository.save(otp);

    // 4. Render template and send verification email
    const emailHtml = this.templateLoader.render('otp-verification', {
      appName: 'VibeU',
      otp: otp.code,
      expiryMinutes,
    });
    this.mailService
      .send(savedUser.email, 'Your Verification Code', emailHtml)
      .catch((err) =>
        this.logger.error(
          `Failed to send verification email to ${savedUser.email}: ${err.message}`,
          err.stack,
        ),
      );

    this.logger.log(
      `User registration process completed successfully for: ${email}`,
    );
  }
}
