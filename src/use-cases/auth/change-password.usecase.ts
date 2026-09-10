import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository, ICryptoService } from '../../core/abstracts';
import { AppException, ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities';

export interface ChangePasswordResult {
  message: string;
}

@Injectable()
export class ChangePasswordUsecase {
  private readonly logger = new Logger(ChangePasswordUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResult> {
    this.logger.log(`Change password attempt for user ID: ${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // If password hash is empty, they must use Create Password endpoint first
    if (user.passwordHash === '') {
      throw new AppException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        400,
        'No password set. Use create password endpoint.',
      );
    }

    // Verify old password
    const isOldPasswordMatch = await this.cryptoService.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isOldPasswordMatch) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        400,
        'Old password is incorrect.',
      );
    }

    const passwordHash = await this.cryptoService.hash(newPassword);
    const updatedUser = new UserEntity(
      user.id,
      user.email,
      passwordHash,
      user.accountStatusId,
      user.role,
      user.isVerified,
      user.createdAt,
      new Date(),
      user.deletedAt,
      user.recoveryEmail,
    );

    await this.userRepository.update(updatedUser);
    this.logger.log(`Password changed successfully for user ID: ${userId}`);

    return {
      message: 'Password changed successfully.',
    };
  }
}
