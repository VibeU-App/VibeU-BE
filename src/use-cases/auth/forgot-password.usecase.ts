import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { IMailService } from '../../services/mail/mail.interface';
import { IOtpService } from '../../services/otp/otp.interface';

export interface ForgotPasswordResult {
  message: string;
}

@Injectable()
export class ForgotPasswordUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
  ) {}

  async execute(email: string): Promise<ForgotPasswordResult> {
    throw new Error('Not implemented');
  }
}
