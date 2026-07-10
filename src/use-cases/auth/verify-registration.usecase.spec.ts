import { VerifyRegistrationUsecase } from './verify-registration.usecase';
import { MockUserRepository, MockOtpService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';
import { OtpEntity } from '../../core/entities/otp.entity';

describe('VerifyRegistrationUsecase', () => {
  let usecase: VerifyRegistrationUsecase;
  let mockUserRepository: MockUserRepository;
  let mockOtpService: MockOtpService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockOtpService = new MockOtpService();
    usecase = new VerifyRegistrationUsecase(mockUserRepository, mockOtpService);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockOtpService.clear();
  });

  it('should verify user with valid OTP', async () => {
    // Pre-add user and valid OTP
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash: '$2b$10$hashed_SecurePass123!',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const validOtp = OtpEntity.create({
      userId: 'user-1',
      code: '123456',
      expiryMinutes: 10,
    });
    mockOtpService.addOtp(validOtp);

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

    const expiredOtp = OtpEntity.create({
      userId: 'user-1',
      code: '999999',
      expiryMinutes: -1, // Already expired
    });
    mockOtpService.addOtp(expiredOtp);

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
