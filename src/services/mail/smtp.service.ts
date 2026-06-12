import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMailService } from './mail.interface';
import { config } from '../../configuration';
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
   * Sends an OTP code for email verification.
   * Uses the otp-verification template.
   */
  async sendOtp(email: string, otp: string): Promise<void> {
    const html = this.templateLoader.render('otp-verification', {
      appName: 'VibeU',
      otp,
      expiryMinutes: 10,
    });

    await this.transporter.sendMail({
      from: `"VibeU" <${config.smtp.user}>`,
      to: email,
      subject: 'Your Verification Code',
      html,
    });
  }

  /**
   * Sends an OTP code for password reset.
   * Uses the password-reset template.
   */
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const html = this.templateLoader.render('password-reset', {
      appName: 'VibeU',
      otp,
      expiryMinutes: 10,
    });

    await this.transporter.sendMail({
      from: `"VibeU" <${config.smtp.user}>`,
      to: email,
      subject: 'Password Reset Code',
      html,
    });
  }

  /**
   * Sends a welcome email after successful verification.
   * Uses the welcome template.
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    const html = this.templateLoader.render('welcome', {
      appName: 'VibeU',
    });

    await this.transporter.sendMail({
      from: `"VibeU" <${config.smtp.user}>`,
      to: email,
      subject: 'Welcome to VibeU!',
      html,
    });
  }
}
