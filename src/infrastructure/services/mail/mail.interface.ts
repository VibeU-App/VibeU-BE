/**
 * Interface for email service.
 * 
 * This abstraction allows use-cases to send emails without knowing
 * the underlying email provider (SMTP, SendGrid, etc.).
 */
export interface IMailService {
  isValidEmail(email: string): boolean;
  getTargetEmail(email: string): string | null;
  sendOtp(email: string, otp: string): Promise<void>;
  sendPasswordResetOtp(email: string, otp: string): Promise<void>;
  sendWelcomeEmail(email: string): Promise<void>;
}
