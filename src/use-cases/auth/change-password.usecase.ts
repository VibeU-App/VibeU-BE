import { Injectable, Inject, Logger, HttpStatus } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
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
        HttpStatus.BAD_REQUEST,
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
        HttpStatus.BAD_REQUEST,
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
    );

    await this.userRepository.update(updatedUser);
    this.logger.log(`Password changed successfully for user ID: ${userId}`);

    return {
      message: 'Password changed successfully.',
    };
  }
}
