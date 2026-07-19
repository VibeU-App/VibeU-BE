import { Injectable } from '@nestjs/common';
import { IOtpRepository } from '../../../core/abstracts/otp-repository.interface';
import { OtpEntity } from '../../../core/entities/otp.entity';
import { PrismaService } from './prisma.service';

/**
 * Prisma implementation of the OTP repository storing OTPs in database.
 */
@Injectable()
export class PrismaOtpRepository implements IOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Saves or updates an OTP for a user.
   */
  async save(otp: OtpEntity): Promise<OtpEntity> {
    const saved = await this.prisma.otp.upsert({
      where: { userId: otp.userId },
      update: {
        code: otp.code,
        expiresAt: otp.expiresAt,
        attempts: otp.attempts,
      },
      create: {
        userId: otp.userId,
        code: otp.code,
        expiresAt: otp.expiresAt,
        attempts: otp.attempts,
      },
    });

    return this.mapToEntity(saved);
  }

  /**
   * Finds an OTP by user ID.
   */
  async findByUserId(userId: string): Promise<OtpEntity | null> {
    const record = await this.prisma.otp.findUnique({
      where: { userId },
    });

    if (!record) {
      return null;
    }

    return this.mapToEntity(record);
  }

  /**
   * Deletes the OTP for a user.
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: { userId },
    });
  }

  /**
   * Increments attempt count for an OTP.
   * Automatically deletes the OTP if max attempts are exceeded.
   */
  async incrementAttempts(userId: string): Promise<boolean> {
    const policy = await this.prisma.policy.findUnique({
      where: { key: 'MAX_OTP_ATTEMPTS' },
    });
    const maxAttempts = policy ? parseInt(policy.value, 10) : 5;

    const record = await this.prisma.otp.update({
      where: { userId },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (record.attempts > maxAttempts) {
      await this.prisma.otp.deleteMany({ where: { userId } });
      return false;
    }

    return true;
  }

  /**
   * Deletes all expired OTPs from the database.
   */
  async deleteExpiredOtps(): Promise<number> {
    const result = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Maps database record to OtpEntity.
   */
  private mapToEntity(record: any): OtpEntity {
    return new OtpEntity(
      record.userId,
      record.code,
      record.expiresAt,
      record.createdAt,
      record.attempts,
      5, // Placeholder, maxAttempts is validated dynamically using policy
    );
  }
}
