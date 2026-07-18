import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository, MockMailService, MockOtpRepository, MockPolicyRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities';

describe('ForgotPasswordUsecase', () => {
  let usecase: ForgotPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockMailService: MockMailService;
  let mockOtpRepository: MockOtpRepository;
  let mockPolicyRepository: MockPolicyRepository;
  let mockTemplateLoader: any;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockMailService = new MockMailService();
    mockOtpRepository = new MockOtpRepository();
    mockPolicyRepository = new MockPolicyRepository();
    mockTemplateLoader = {
      render: jest.fn().mockImplementation((name, vars) => JSON.stringify(vars)),
    };
    usecase = new ForgotPasswordUsecase(
      mockUserRepository,
      mockMailService,
      mockOtpRepository,
      mockPolicyRepository,
      mockTemplateLoader,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockMailService.clear();
    mockOtpRepository.clear();
    mockPolicyRepository.clear();
  });

  it('should always return success message even if user not found', async () => {
    // Security: Never reveal if email exists
    const testResult = await usecase.execute('nonexistent@example.com');

    expect(testResult.message).toBe("If that email is registered, an OTP has been sent.");
  });

  it('should send OTP if user exists', async () => {
    const user : UserEntity = UserEntity.create({
      email: "user@example.edu.vn",
      passwordHash: "i3hr92hr9ebfusboc",
    });

    mockUserRepository.addUser(user);

    await usecase.execute('user@example.edu.vn');
    
    // Verify that an email is sent
    expect(mockMailService.sentEmails.length).toBe(1);

    // Verify that the email is sent to the right user
    expect(mockMailService.sentEmails[0].email).toEqual(user.email);

    // Verify that the OTP is truthy
    const content = JSON.parse(mockMailService.sentEmails[0].content);
    expect(content.otp).toBeTruthy();
  });

  it('should reject if not a .edu email', async () => {
    const user : UserEntity = UserEntity.create({
      email: "user@notedu.com",
      passwordHash: "i3hr92hr9ebfusboc",
    });

    mockUserRepository.addUser(user);

    await usecase.execute("user@notedu.com");

    // Verify that no email is sent if it's not a .edu email
    expect(mockMailService.sentEmails.length).toEqual(0);
  });

  it('should normalize emails', async () => {
    const user : UserEntity = UserEntity.create({
      email: "user1+tag1@example.edu",
      passwordHash: "i3hr92hr9ebfusboc",
    });

    mockUserRepository.addUser(user);

    await usecase.execute("user1+tag1@example.edu");

    expect(mockMailService.sentEmails[0]["email"]).toBe("user1@example.edu");
  });
});
