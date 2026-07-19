import { OtpEntity } from '../entities/otp.entity';

/**
 * Interface for OTP repository.
 */
export interface IOtpRepository {
  save(otp: OtpEntity): Promise<OtpEntity>;
  findByUserId(userId: string): Promise<OtpEntity | null>;
  deleteByUserId(userId: string): Promise<void>;
  incrementAttempts(userId: string): Promise<boolean>;
  deleteExpiredOtps(): Promise<number>;
}
