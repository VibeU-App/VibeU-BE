import { VerifyRegistrationUsecase } from './verify-registration.usecase';
import { MockUserRepository, MockOtpRepository, MockSessionRepository, MockTokenService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';
import { OtpEntity } from '../../core/entities/otp.entity';

describe('VerifyRegistrationUsecase', () => {
  let usecase: VerifyRegistrationUsecase;
  let mockUserRepository: MockUserRepository;
  let mockOtpRepository: MockOtpRepository;
  let mockSessionRepository: MockSessionRepository;
  let mockTokenService: MockTokenService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockOtpRepository = new MockOtpRepository();
    mockSessionRepository = new MockSessionRepository();
    mockTokenService = new MockTokenService();
    usecase = new VerifyRegistrationUsecase(
      mockUserRepository,
      mockOtpRepository,
      mockSessionRepository,
      mockTokenService,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockOtpRepository.clear();
    mockSessionRepository.clear();
  });

  it('should verify user with valid OTP and log them in', async () => {
    // Pre-add user and valid OTP
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: '',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const validOtp = OtpEntity.create({
      userId: 'user-1',
      code: '123456',
      expiryMinutes: 10,
    });
    mockOtpRepository.addOtp(validOtp);

    const result = await usecase.execute('user@example.edu', '123456');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('user@example.edu');
  });

  it('should reject invalid OTP', async () => {
    // Pre-add user but no OTP
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: '',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    try {
      await usecase.execute('user@example.edu', '000000');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject expired OTP', async () => {
    // Pre-add user and expired OTP
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: '',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const expiredOtp = OtpEntity.create({
      userId: 'user-1',
      code: '999999',
      expiryMinutes: -1, // Already expired
    });
    mockOtpRepository.addOtp(expiredOtp);

    try {
      await usecase.execute('user@example.edu', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });

  it('should reject if user not found', async () => {
    try {
      await usecase.execute('nonexistent@example.edu', '123456');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });
});
