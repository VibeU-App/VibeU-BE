import { IOtpRepository, OtpEntity } from './otp-repository.interface';

export class MockOtpRepository implements IOtpRepository {
  private otps: Map<string, OtpEntity> = new Map();

  async save(otp: OtpEntity): Promise<OtpEntity> {
    this.otps.set(otp.email, otp);
    return otp;
  }

  async findByEmailAndCode(email: string, code: string): Promise<OtpEntity | null> {
    const otp = this.otps.get(email);
    if (otp && otp.code === code) {
      return otp;
    }
    return null;
  }

  async deleteByEmail(email: string): Promise<void> {
    this.otps.delete(email);
  }

  // Test helper
  addOtp(otp: OtpEntity): void {
    this.otps.set(otp.email, otp);
  }

  clear(): void {
    this.otps.clear();
  }
}