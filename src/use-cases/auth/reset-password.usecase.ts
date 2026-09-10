import { Injectable, Inject } from '@nestjs/common';
import {
  IUserRepository,
  ICryptoService,
  IJwtService,
} from '../../core/abstracts';
import { UserEntity } from '../../core/entities';
import { AppException, ErrorCode } from '../../core/errors';

export interface ResetPasswordResult {
  message: string;
}

@Injectable()
export class ResetPasswordUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICryptoService')
    private readonly cryptoService: ICryptoService,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
  ) {}

  async execute(
    newPassword: string,
    resetToken: string,
  ): Promise<ResetPasswordResult> {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    if (!strongPasswordRegex.test(newPassword)) {
      throw new AppException(ErrorCode.AUTH_WEAK_PASSWORD);
    }

    const tokenData = this.jwtService.verifyToken(resetToken);
    const userId = tokenData?.sub;
    const tokenHash = tokenData?.hash;

    if (userId) {
      const user = await this.userRepository.findById(userId);

      if (user) {
        // Enforce single-use reset token
        if (user.passwordHash !== tokenHash) {
          throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
        }

        const isSamePassword = await this.cryptoService.compare(
          newPassword,
          user.passwordHash,
        );
        if (isSamePassword) {
          throw new AppException(ErrorCode.AUTH_MATCHING_OLD_PASSWORD);
        }

        const passwordHash = await this.cryptoService.hash(newPassword);

        const newUser = new UserEntity(
          userId,
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

        await this.userRepository.update(newUser);

        return {
          message: 'Password reset successfully',
        };
      }
    }

    throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND);
  }
}
