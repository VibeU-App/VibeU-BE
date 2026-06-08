import { IUserRepository } from './user-repository.interface';
import { IHashService } from './hash-service.interface';
import { IEmailService } from './email-service.interface';
import { IOtpRepository } from './otp-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

export class RegisterUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly emailService: IEmailService,
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    throw new Error('Not implemented');
  }
}