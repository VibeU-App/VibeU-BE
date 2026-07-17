import { OtpEntity } from '../../../core/entities/otp.entity';

/**
 * Interface for OTP service.
 *
 * OTPs are stored in memory (not database) because:
 * - Short-lived (expire in minutes)
 * - Don't need to survive server restarts
 * - Faster lookups
 * - No cleanup needed
 *
 * Includes attempt tracking to prevent brute force attacks.
 */
export interface IOtpService {
  /**
   * Saves an OTP for a user.
   * Overwrites any existing OTP for the same user.
   */
  save(otp: OtpEntity): Promise<OtpEntity>;

  /**
   * Finds an OTP by user ID and code.
   * Returns null if not found.
   */
  findByUserId(userId: string): Promise<OtpEntity | null>;

  /**
   * Deletes all OTPs for a user.
   * Called after successful verification.
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Increments attempt count for an OTP.
   * Returns false if max attempts exceeded.
   */
  incrementAttempts(userId: string): Promise<boolean>;
}
