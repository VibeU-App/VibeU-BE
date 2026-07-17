import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IJwtService } from '../../services/token';
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

  async execute(newPassword: string, resetToken: string): Promise<ResetPasswordResult> {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    
    if (!strongPasswordRegex.test(newPassword)) {
      throw new BadRequestException({
        code: ErrorCode.AUTH_WEAK_PASSWORD,
        message: "Password is too weak",
      });
    }

    const tokenData = this.jwtService.verifyToken(resetToken);
    const userId = tokenData?.sub;
    
    if (!!userId) {
      const user = await this.userRepository.findById(userId);

      if (!!user) {
        const passwordHash = await this.cryptoService.hash(newPassword);
        
        if (user.passwordHash === passwordHash) {
          throw new BadRequestException({
            code: ErrorCode.AUTH_MATCHING_OLD_PASSWORD,
            message: "New password must be different from old password",
          });
        }

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
