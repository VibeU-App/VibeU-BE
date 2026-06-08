import { RegisterUsecase } from './register.usecase';
import { MockUserRepository } from './mock-user-repository';
import { MockHashService } from './mock-hash-service';
import { MockEmailService } from './mock-email-service';
import { MockOtpRepository } from './mock-otp-repository';
import { ErrorCode } from '../../core/errors';

describe('RegisterUsecase', () => {
  let usecase: RegisterUsecase;
  let mockUserRepository: MockUserRepository;
  let mockHashService: MockHashService;
  let mockEmailService: MockEmailService;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockHashService = new MockHashService();
    mockEmailService = new MockEmailService();
    mockOtpRepository = new MockOtpRepository();
    usecase = new RegisterUsecase(
      mockUserRepository,
      mockHashService,
      mockEmailService,
      mockOtpRepository,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockEmailService.clear();
    mockOtpRepository.clear();
  });

  it('should register a new user with valid email and password', async () => {
    const result = await usecase.execute('test@example.com', 'SecurePass123!');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });

  it('should reject registration with duplicate email', async () => {
    // TODO: Pre-add user and expect AUTH_EMAIL_ALREADY_EXISTS error
    try {
      await usecase.execute('existing@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
  });

  it('should send OTP after successful registration', async () => {
    await usecase.execute('test@example.com', 'SecurePass123!');
    // TODO: Verify OTP was sent
  });

  it('should hash password before saving', async () => {
    await usecase.execute('test@example.com', 'SecurePass123!');
    // TODO: Verify password was hashed
  });
});