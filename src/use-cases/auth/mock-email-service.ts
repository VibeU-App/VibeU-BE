import { IEmailService } from './email-service.interface';

export class MockEmailService implements IEmailService {
  public sentEmails: Array<{ email: string; otp: string }> = [];

  async sendOtp(email: string, otp: string): Promise<void> {
    this.sentEmails.push({ email, otp });
  }

  clear(): void {
    this.sentEmails = [];
  }
}