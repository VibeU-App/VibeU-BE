import { IUserRepository } from './user-repository.interface';
import { ICryptoService } from '../../services/crypto/crypto.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpRepository } from './otp-repository.interface';
import { UserEntity } from '../../core/entities/user.entity';

export interface RegisterResult {
  user: Omit<UserEntity, 'passwordHash'>;
}

export class RegisterUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: ICryptoService,
    private readonly mailService: IMailService,
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    throw new Error('Not implemented');
  }
}
