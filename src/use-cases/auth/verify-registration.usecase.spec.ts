import { VerifyRegistrationUsecase } from './verify-registration.usecase';
import { MockUserRepository, MockOtpRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('VerifyRegistrationUsecase', () => {
  let usecase: VerifyRegistrationUsecase;
  let mockUserRepository: MockUserRepository;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockOtpRepository = new MockOtpRepository();
    usecase = new VerifyRegistrationUsecase(mockUserRepository, mockOtpRepository);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockOtpRepository.clear();
  });

  it('should verify user with valid OTP', async () => {
    // Pre-add user and valid OTP
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash: '$2b$10$hashed_SecurePass123!',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);
    mockOtpRepository.addOtp({
      id: 'valid-otp-1',
      email: 'user@example.com',
      code: '123456',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
    });

    const result = await usecase.execute('user@example.com', '123456');
    expect(result.message).toBeDefined();
  });

  it('should reject invalid OTP', async () => {
    // Pre-add user but no OTP
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash: '$2b$10$hashed_SecurePass123!',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    try {
      await usecase.execute('user@example.com', '000000');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject expired OTP', async () => {
    // Pre-add user and expired OTP
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash: '$2b$10$hashed_SecurePass123!',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);
    mockOtpRepository.addOtp({
      id: 'expired-otp-1',
      email: 'user@example.com',
      code: '999999',
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    });

    try {
      await usecase.execute('user@example.com', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });

  it('should reject if user not found', async () => {
    try {
      await usecase.execute('nonexistent@example.com', '123456');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });
});