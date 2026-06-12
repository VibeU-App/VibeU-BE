import { OtpEntity } from '../../core/entities/otp.entity';

/**
 * Interface for OTP repository.
 * 
 * Defines the contract for OTP data access.
 */
export interface IOtpRepository {
  save(otp: OtpEntity): Promise<OtpEntity>;
  findByUserIdAndCode(userId: string, code: string): Promise<OtpEntity | null>;
  deleteByUserId(userId: string): Promise<void>;
}
