import { IUserRepository } from './user-repository.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpRepository } from './otp-repository.interface';

export interface OtpResult {
  message: string;
}

export class ForgotPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(email: string): Promise<OtpResult> {
    throw new Error('Not implemented');
  }
}
