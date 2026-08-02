import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../core/abstracts/user-repository.interface';
import { ICryptoService } from '../../infrastructure/services/crypto/crypto.interface';
import { IJwtService } from '../../infrastructure/services/token';
import { UserEntity } from '../../core/entities';
import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '../../core/errors';

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
      throw new BadRequestException({
        code: ErrorCode.AUTH_WEAK_PASSWORD,
        message: 'Password is too weak',
      });
    }

    const tokenData = this.jwtService.verifyToken(resetToken);
    const userId = tokenData?.sub;
    const tokenHash = tokenData?.hash;

    if (userId) {
      const user = await this.userRepository.findById(userId);

      if (user) {
        // Enforce single-use reset token
        if (user.passwordHash !== tokenHash) {
          throw new BadRequestException({
            code: ErrorCode.AUTH_INVALID_TOKEN,
            message: 'Reset token is invalid or has already been used',
          });
        }

        const isSamePassword = await this.cryptoService.compare(
          newPassword,
          user.passwordHash,
        );
        if (isSamePassword) {
          throw new BadRequestException({
            code: ErrorCode.AUTH_MATCHING_OLD_PASSWORD,
            message: 'New password must be different from old password',
          });
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
        );

        await this.userRepository.update(newUser);

        return {
          message: 'Password reset successfully',
        };
      }
    }

    throw new BadRequestException({
      code: ErrorCode.AUTH_USER_NOT_FOUND,
      message: 'Invalid or expired OTP',
    });
  }
}
