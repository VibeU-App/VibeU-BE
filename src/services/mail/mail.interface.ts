/**
 * Interface for email service.
 * 
 * This abstraction allows use-cases to send emails without knowing
 * the underlying email provider (SMTP, SendGrid, etc.).
 */
export interface IMailService {
  sendOtp(email: string, otp: string): Promise<void>;
  sendPasswordResetOtp(email: string, otp: string): Promise<void>;
  sendWelcomeEmail(email: string): Promise<void>;
}
