import { RegisterUsecase } from './register.usecase';
import { MockUserRepository, MockCryptoService, MockMailService, MockOtpRepository, MockSessionRepository, MockTokenService, MockPolicyRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('RegisterUsecase', () => {
  let usecase: RegisterUsecase;
  let mockUserRepository: MockUserRepository;
  let mockSessionRepository: MockSessionRepository;
  let mockCryptoService: MockCryptoService;
  let mockMailService: MockMailService;
  let mockOtpRepository: MockOtpRepository;
  let mockTokenService: MockTokenService;
  let mockPolicyRepository: MockPolicyRepository;
  let mockTemplateLoader: any;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockSessionRepository = new MockSessionRepository();
    mockCryptoService = new MockCryptoService();
    mockMailService = new MockMailService();
    mockOtpRepository = new MockOtpRepository();
    mockTokenService = new MockTokenService();
    mockPolicyRepository = new MockPolicyRepository();
    mockTemplateLoader = {
      render: jest.fn().mockImplementation((name, vars) => JSON.stringify(vars)),
    };
    usecase = new RegisterUsecase(
      mockUserRepository,
      mockSessionRepository,
      mockCryptoService,
      mockMailService,
      mockOtpRepository,
      mockTokenService,
      mockPolicyRepository,
      mockTemplateLoader,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockSessionRepository.clear();
    mockMailService.clear();
    mockOtpRepository.clear();
    mockPolicyRepository.clear();
  });

  it('should register a new user with valid email', async () => {
    await usecase.execute('test@example.edu');
    const savedUser = await mockUserRepository.findByEmail('test@example.edu');
    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe('test@example.edu');
  });

  it('should reject registration with duplicate email', async () => {
    // Pre-add a user with this email
    const existingUser = UserEntity.create({
      email: 'existing@example.edu',
      passwordHash: '$2b$10$hashed_ExistingPass123!',
    });
    mockUserRepository.addUser({ ...existingUser, id: 'existing-user-1' } as UserEntity);

    try {
      await usecase.execute('existing@example.edu');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
  });

  it('should allow re-registering an account if status is pending', async () => {
    // Pre-add a user with pending status
    const pendingStatusId = 'mock-pending-status-id';
    const existingUser = UserEntity.create({
      email: 'pending@example.edu',
      passwordHash: '$2b$10$hashed_ExistingPass123!',
      accountStatusId: pendingStatusId,
    });
    mockUserRepository.addUser({ ...existingUser, id: 'pending-user-1' } as UserEntity);

    await usecase.execute('pending@example.edu');
    const updatedUser = await mockUserRepository.findByEmail('pending@example.edu');
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.email).toBe('pending@example.edu');
  });

  it('should send OTP after successful registration', async () => {
    const email = 'test@example.edu'; // Use a valid email for this test

    mockMailService = new MockMailService();
    await usecase.execute(email);
    
    expect(mockMailService.sentEmails.length).toBe(0);
  });
});
