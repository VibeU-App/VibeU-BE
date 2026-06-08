import { VerifyOtpUsecase } from './verify-otp.usecase';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors';

describe('VerifyOtpUsecase', () => {
  let usecase: VerifyOtpUsecase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    usecase = new VerifyOtpUsecase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should return reset token with valid OTP', async () => {
    const email = 'user@example.com';
    const otp = '123456';

    const existingUser = UserEntity.create({
      email,
      passwordHash: 'hashed-password',
    });
    mockRepository.addUser(existingUser);

    const result = await usecase.execute(email, otp);

    expect(result.resetToken).toBeDefined();
  });

  it('should reject if user not found', async () => {
    const email = 'nonexistent@example.com';
    const otp = '123456';

    try {
      await usecase.execute(email, otp);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });

  it('should reject invalid OTP', async () => {
    const email = 'user@example.com';
    const invalidOtp = '000000';

    const existingUser = UserEntity.create({
      email,
      passwordHash: 'hashed-password',
    });
    mockRepository.addUser(existingUser);

    try {
      await usecase.execute(email, invalidOtp);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject expired OTP', async () => {
    const email = 'user@example.com';
    const expiredOtp = '999999';

    const existingUser = UserEntity.create({
      email,
      passwordHash: 'hashed-password',
    });
    mockRepository.addUser(existingUser);

    try {
      await usecase.execute(email, expiredOtp);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });
});