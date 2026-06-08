export interface OtpEntity {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
}

export interface IOtpRepository {
  save(otp: OtpEntity): Promise<OtpEntity>;
  findByEmailAndCode(email: string, code: string): Promise<OtpEntity | null>;
  deleteByEmail(email: string): Promise<void>;
}