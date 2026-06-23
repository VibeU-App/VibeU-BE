import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IJwtService } from '../../services/token';
import { UserEntity } from '../../core/entities';
import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '../../core/errors';

export interface ResetPasswordResult {
  message: string;
}

export class ResetPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: ICryptoService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(newPassword: string, resetToken: string): Promise<ResetPasswordResult> {
    const tokenData = this.jwtService.verifyToken(resetToken);
    const userId = tokenData?.sub;

    
    if (!!userId) {
      const user = await this.userRepository.findById(userId);

      
      if (!!user) {
        const passwordHash = await this.cryptoService.hash(newPassword);
        const newUser : UserEntity = {
          id: userId,
          email: user.email,
          passwordHash: passwordHash,
          accountStatusId: user.accountStatusId,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: new Date(Date.now()),
          deletedAt: user.deletedAt,
          isActive: user.isActive,
        }

        await this.userRepository.update(newUser);

        return {
          message: "Password reset successfully"
        }
      }
    } 

    throw new BadRequestException({ 
        code: ErrorCode.AUTH_USER_NOT_FOUND,
        message: "Invalid or expired OTP",
    });
  }
}
