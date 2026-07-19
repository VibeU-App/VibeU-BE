import { LoginUsecase } from './login.usecase';
import { MockUserRepository, MockCryptoService, MockTokenService, MockSessionRepository, MockOtpRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';
import { LoginType } from '../../core/dtos/auth/login.dto';
import { OtpEntity } from '../../core/entities';

describe('LoginUsecase', () => {
  let usecase: LoginUsecase;
  let mockUserRepository: MockUserRepository;
  let mockSessionRepository: MockSessionRepository;
  let mockCryptoService: MockCryptoService;
  let mockTokenService: MockTokenService;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockSessionRepository = new MockSessionRepository();
    mockCryptoService = new MockCryptoService();
    mockTokenService = new MockTokenService();
    mockOtpRepository = new MockOtpRepository();

    usecase = new LoginUsecase(
      mockUserRepository,
      mockSessionRepository,
      mockCryptoService,
      mockOtpRepository,
      mockTokenService,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockSessionRepository.clear();
    mockOtpRepository.clear();
  });

  it('should return access token and user data with valid credentials', async () => {
    // Pre-add a verified user
    const password = 'SecurePass123!';
    const passwordHash = await mockCryptoService.hash(password);
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash,
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const result = await usecase.execute('user@example.edu', { password });

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('user@example.edu');
  });

  it('should reject login with non-existent email', async () => {
    try {
      await usecase.execute('nonexistent@example.edu', { password: 'SecurePass123!' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login with wrong password', async () => {
    // Pre-add a user
    const passwordHash = await mockCryptoService.hash('CorrectPass123!');
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash,
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    try {
      await usecase.execute('user@example.edu', { password: 'WrongPass456!' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login if user is not verified', async () => {
    // Pre-add an unverified user
    const user = UserEntity.create({
      email: 'unverified@example.edu',
      passwordHash: await mockCryptoService.hash('SecurePass123!'),
      isVerified: false,
    });
    mockUserRepository.addUser({ ...user, id: 'unverified-user-1' } as UserEntity);

    try {
      await usecase.execute('unverified@example.edu', { password: 'SecurePass123!' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }
  });

  it('should return access token with valid OTP', async () => {
    const user = UserEntity.create({
      email: 'otpuser@example.edu',
      passwordHash: 'dummy-hash',
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-otp-1' } as UserEntity);

    const otp = OtpEntity.create({
      userId: 'user-otp-1',
      code: '123456',
      expiryMinutes: 15,
    });
    await mockOtpRepository.save(otp);

    const result = await usecase.execute('otpuser@example.edu', { otp: '123456', type: LoginType.OTP });

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('otpuser@example.edu');
  });

  it('should reject OTP login with incorrect OTP code', async () => {
    const user = UserEntity.create({
      email: 'otpuser@example.edu',
      passwordHash: 'dummy-hash',
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-otp-1' } as UserEntity);

    const otp = OtpEntity.create({
      userId: 'user-otp-1',
      code: '123456',
      expiryMinutes: 15,
    });
    await mockOtpRepository.save(otp);

    try {
      await usecase.execute('otpuser@example.edu', { otp: 'wrong-otp', type: LoginType.OTP });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });
});