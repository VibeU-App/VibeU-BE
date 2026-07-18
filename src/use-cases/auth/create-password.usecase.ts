import { Injectable, Inject, Logger, HttpStatus } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { AppException, ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities';

export interface CreatePasswordResult {
  message: string;
}

@Injectable()
export class CreatePasswordUsecase {
  private readonly logger = new Logger(CreatePasswordUsecase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
  ) {}

  async execute(userId: string, password: string): Promise<CreatePasswordResult> {
    this.logger.log(`Create password attempt for user ID: ${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // If password hash is already set (non-empty), they must use Change Password endpoint
    if (user.passwordHash !== '') {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST, 'Password already set. Use change password endpoint.');
    }

    const passwordHash = await this.cryptoService.hash(password);
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
    this.logger.log(`Password created successfully for user ID: ${userId}`);

    return {
      message: 'Password created successfully.',
    };
  }
}
