import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { IOtpRepository } from '../../core/abstracts/otp-repository.interface';
import { AppException } from '../../core/errors/app-exception';
import { ErrorCode } from '../../core/errors/error-codes';
import { AccountStatusName, UserEntity } from '../../core/entities/user.entity';

export interface VerifyRegistrationResult {
  message: string;
}

@Injectable()
export class VerifyRegistrationUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpRepository')
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(email: string, otpCode: string): Promise<VerifyRegistrationResult> {
    // 1. Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // 2. Check if already verified
    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    // 3. Verify OTP
    const otp = await this.otpRepository.findByUserId(user.id);
    if (!otp) {
      throw new AppException(ErrorCode.AUTH_OTP_INVALID);
    }

    if (otp.code !== otpCode) {
      await this.otpRepository.incrementAttempts(user.id);
      throw new AppException(ErrorCode.AUTH_OTP_INVALID);
    }

    // Check if expired
    if (otp.isExpired()) {
      await this.otpRepository.deleteByUserId(user.id);
      throw new AppException(ErrorCode.AUTH_OTP_EXPIRED);
    }

    // Check max attempts
    if (otp.isMaxAttemptsReached()) {
      await this.otpRepository.deleteByUserId(user.id);
      throw new AppException(ErrorCode.AUTH_OTP_INVALID);
    }

    // 4. Update user status to ACTIVE
    const activeStatusId = await this.userRepository.findStatusByName(AccountStatusName.ACTIVE);
    if (!activeStatusId) {
      throw new Error('Active account status not found in system');
    }

    const updatedUser = new UserEntity(
      user.id,
      user.email,
      user.passwordHash,
      activeStatusId,
      user.role,
      true, // Set isVerified to true
      user.createdAt,
      new Date(), // Updated at
      user.deletedAt,
    );

    await this.userRepository.update(updatedUser);

    // 5. Cleanup OTPs
    await this.otpRepository.deleteByUserId(user.id);

    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }
}
