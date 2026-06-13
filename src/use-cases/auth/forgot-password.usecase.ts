import { IUserRepository } from './user-repository.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpService } from '../../services/otp/otp.interface';

export interface OtpResult {
  message: string;
}

export class ForgotPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly otpService: IOtpService,
  ) {}

  async execute(email: string): Promise<OtpResult> {
    throw new Error('Not implemented');
  }
}
