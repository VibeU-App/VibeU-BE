import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMailService } from './mail.interface';
import { config } from '../../../configuration';

/**
 * SMTP email service implementation using nodemailer.
 *
 * Exposes a generic send method adhering to OCP and ISP.
 */
@Injectable()
export class SmtpMailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // true for 465, false for other ports (587 uses STARTTLS)
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  /**
   * Tests the validity of an email:
   * - Follows standard email format
   * - Must contain ".edu" anywhere in the domain name
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    const domain = email.split('@')[1];
    return domain.toLowerCase().includes('.edu');
  }

  /**
   * Gets the target email:
   * - If the identifier contains "+", the rest of the identifier will be ignored.
   * - If the email is invalid, null is returned
   */
  getTargetEmail(email: string): string | null {
    if (this.isValidEmail(email)) {
      const emailParts = email.split('@');
      const identifier = emailParts[0];
      const domains = emailParts[1];
      let targetEmail = email;

      if (identifier.includes('+')) {
        targetEmail = targetEmail.split('+')[0] + '@' + domains;
      }

      if (identifier.includes('.') && domains.split('.')[0] == 'gmail') {
        targetEmail =
          targetEmail.split('@')[0].replaceAll('.', '') + '@' + domains;
      }

      return targetEmail.toLowerCase();
    } else {
      return null;
    }
  }

  /**
   * Sends an email with generic HTML content.
   */
  async send(to: string, subject: string, content: string): Promise<void> {
    const targetEmail: string | null = this.getTargetEmail(to);
    if (targetEmail === null) {
      throw new Error(
        `Cannot send email: recipient address '${to}' does not contain '.edu' in the domain.`,
      );
    }

    await this.transporter.sendMail({
      from: `"VibeU" <${config.smtp.user}>`,
      to: targetEmail,
      subject,
      html: content,
    });
  }
}
