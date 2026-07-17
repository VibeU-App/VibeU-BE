import { RegisterUsecase } from './register.usecase';
import { MockUserRepository, MockCryptoService, MockMailService, MockOtpService, MockSessionRepository, MockJwtService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('RegisterUsecase', () => {
  let usecase: RegisterUsecase;
  let mockUserRepository: MockUserRepository;
  let mockSessionRepository: MockSessionRepository;
  let mockCryptoService: MockCryptoService;
  let mockMailService: MockMailService;
  let mockOtpService: MockOtpService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockSessionRepository = new MockSessionRepository();
    mockCryptoService = new MockCryptoService();
    mockMailService = new MockMailService();
    mockOtpService = new MockOtpService();
    mockJwtService = new MockJwtService();
    usecase = new RegisterUsecase(
      mockUserRepository,
      mockSessionRepository,
      mockCryptoService,
      mockMailService,
      mockOtpService,
      mockJwtService,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockSessionRepository.clear();
    mockMailService.clear();
    mockOtpService.clear();
  });

  it('should register a new user with valid email and password', async () => {
    const result = await usecase.execute('test@example.com', 'SecurePass123!');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });

  it('should reject registration with duplicate email', async () => {
    // Pre-add a user with this email
    const existingUser = UserEntity.create({
      email: 'existing@example.com',
      passwordHash: '$2b$10$hashed_ExistingPass123!',
    });
    mockUserRepository.addUser({ ...existingUser, id: 'existing-user-1' } as UserEntity);

    try {
      await usecase.execute('existing@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
  });

  it('should send OTP after successful registration', async () => {
    const email = 'test@example.com'; // Use a valid email for this test

    mockMailService = new MockMailService();
    await usecase.execute(email, 'SecurePass123!');
    
    expect(mockMailService.sentEmails.length).toBe(0);
  });

  it('should hash password before saving', async () => {
    const email = 'test@example.com';
    const password = 'SecurePass123!';
    await usecase.execute(email, password);
    
    const user = await mockUserRepository.findByEmail(email);
    expect(user?.passwordHash).not.toBe(password);
    expect(user?.passwordHash).toContain('hashed_');
  });
});
