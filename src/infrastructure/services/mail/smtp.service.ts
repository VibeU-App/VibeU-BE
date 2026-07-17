import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMailService } from './mail.interface';
import { config } from '../../../configuration';
import { TemplateLoaderService } from '../template/template-loader.service';

/**
 * SMTP email service implementation using nodemailer.
 * 
 * This service sends emails using HTML templates loaded into memory.
 * Templates are loaded once at startup and reused for all email sends.
 * 
 * Supported email types:
 * - OTP verification (registration)
 * - Password reset OTP
 * - Welcome email (after verification)
 */
@Injectable()
export class SmtpMailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly templateLoader: TemplateLoaderService) {
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
   * - Only student emails are allowed (.edu)
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^\w[+-.\w]*\@[-a-z0-9]+(\.[-a-z0-9]+)*\.edu(\.[a-z]{2})?$/;
    return emailRegex.test(email.toLowerCase());
  }

  /**
   * Gets the target email:
   * - If the identifier contains "+", the rest of the identifier will be ignored.
   * - If the identifier of a ".gmail" email contains ".", it will be ignored.
   * - If the email is invalid, null is returned
   */
  getTargetEmail(email: string): string | null {
    if (this.isValidEmail(email)) {
      const emailParts = email.split("@");
      const identifier = emailParts[0];
      const domains = emailParts[1];
      let targetEmail = email;

      if (identifier.includes("+")) {
        targetEmail = targetEmail.split("+")[0] + "@" + domains;
      }

      if (identifier.includes(".") && domains.split(".")[0] == "gmail") {
        targetEmail = targetEmail.split("@")[0].replaceAll(".", "") + "@" + domains;
      }

      return targetEmail.toLowerCase();
    } else {
      return null;
    }
  }

  /**
   * Sends an OTP code for email verification.
   * Uses the otp-verification template.
   */
  async sendOtp(email: string, otp: string): Promise<void> {
    const targetEmail : string | null = this.getTargetEmail(email);
    if (targetEmail !== null) {
      const html = this.templateLoader.render('otp-verification', {
        appName: 'VibeU',
        otp,
        expiryMinutes: 10,
      });

      await this.transporter.sendMail({
        from: `"VibeU" <${config.smtp.user}>`,
        to: targetEmail,
        subject: 'Your Verification Code',
        html,
      });
    }
  }

  /**
   * Sends an OTP code for password reset.
   * Uses the password-reset template.
   */
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const targetEmail : string | null = this.getTargetEmail(email);
    if (targetEmail !== null) {
      const html = this.templateLoader.render('password-reset', {
        appName: 'VibeU',
        otp,
        expiryMinutes: 10,
      });

      await this.transporter.sendMail({
        from: `"VibeU" <${config.smtp.user}>`,
        to: targetEmail,
        subject: 'Password Reset Code',
        html,
      });
    }
  }

  /**
   * Sends a welcome email after successful verification.
   * Uses the welcome template.
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    const targetEmail : string | null = this.getTargetEmail(email);
    if (targetEmail !== null) {
      const html = this.templateLoader.render('welcome', {
        appName: 'VibeU',
      });

      await this.transporter.sendMail({
        from: `"VibeU" <${config.smtp.user}>`,
        to: targetEmail,
        subject: 'Welcome to VibeU!',
        html,
      });
    }
  }
}
