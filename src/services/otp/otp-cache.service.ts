import { Injectable, Logger } from '@nestjs/common';
import { IOtpService } from './otp.interface';
import { OtpEntity } from '../../core/entities/otp.entity';

/**
 * In-memory OTP service implementation.
 *
 * Stores OTPs in a HashMap instead of database because:
 * - OTPs are short-lived (expire in minutes)
 * - No need to survive server restarts
 * - Faster lookups (O(1) vs DB query)
 * - No cleanup job needed for expired OTPs
 *
 * Includes attempt tracking to prevent brute force attacks:
 * - Each OTP has a max attempts limit (default: 5)
 * - Attempts are incremented on each verification try
 * - OTP is invalidated when max attempts reached
 *
 * Key format: userId:code
 * This allows multiple OTPs per user (e.g., verification + password reset)
 */
@Injectable()
export class OtpCacheService implements IOtpService {
  private readonly logger = new Logger(OtpCacheService.name);

  // In-memory storage: key = "userId:code", value = OtpEntity
  private otps = new Map<string, OtpEntity>();

  /**
   * Saves an OTP for a user.
   * Overwrites any existing OTP for the same user and code.
   */
  async save(otp: OtpEntity): Promise<OtpEntity> {
    const key = this.getKey(otp.userId, otp.code);
    this.otps.set(key, otp);
    this.logger.debug(`Saved OTP for user ${otp.userId}`);
    return otp;
  }

  /**
   * Finds an OTP by user ID and code.
   * Returns null only if not found.
   */
  async findByUserIdAndCode(userId: string, code: string): Promise<OtpEntity | null> {
    const key = this.getKey(userId, code);
    return this.otps.get(key) || null;
  }

  /**
   * Deletes all OTPs for a user.
   * Called after successful verification.
   */
  async deleteByUserId(userId: string): Promise<void> {
    // Delete all OTPs for this user (could have multiple codes)
    for (const key of this.otps.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.otps.delete(key);
      }
    }
    this.logger.debug(`Deleted all OTPs for user ${userId}`);
  }

  /**
   * Increments attempt count for an OTP.
   * Returns false if max attempts exceeded.
   */
  async incrementAttempts(userId: string, code: string): Promise<boolean> {
    const key = this.getKey(userId, code);
    const otp = this.otps.get(key);

    if (!otp) {
      return false;
    }

    const withinLimit = otp.incrementAttempts();

    if (!withinLimit) {
      // Max attempts exceeded, remove OTP
      this.otps.delete(key);
      this.logger.warn(`Max attempts exceeded for user ${userId}`);
      return false;
    }

    return true;
  }

  /**
   * Generates cache key from userId and code.
   */
  private getKey(userId: string, code: string): string {
    return `${userId}:${code}`;
  }
}
