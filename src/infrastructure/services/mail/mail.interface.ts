/**
 * Interface for email service.
 *
 * This abstraction allows use-cases to send emails without knowing
 * the underlying email provider (SMTP, SendGrid, etc.).
 * Adheres to Interface Segregation Principle (ISP) and Open/Closed Principle (OCP).
 */
export interface IMailService {
  isValidEmail(email: string): boolean;
  getTargetEmail(email: string): string | null;
  send(to: string, subject: string, content: string): Promise<void>;
}
