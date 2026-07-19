import { RequestLoginOtpUsecase } from './request-login-otp.usecase';
import { MockUserRepository, MockOtpRepository, MockPolicyRepository, MockMailService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('RequestLoginOtpUsecase', () => {
  let usecase: RequestLoginOtpUsecase;
  let mockUserRepository: MockUserRepository;
  let mockOtpRepository: MockOtpRepository;
  let mockPolicyRepository: MockPolicyRepository;
  let mockMailService: MockMailService;
  let mockTemplateLoader: any;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockOtpRepository = new MockOtpRepository();
    mockPolicyRepository = new MockPolicyRepository();
    mockMailService = new MockMailService();
    mockTemplateLoader = {
      render: jest.fn().mockImplementation((name, vars) => JSON.stringify(vars)),
    };

    usecase = new RequestLoginOtpUsecase(
      mockUserRepository,
      mockOtpRepository,
      mockPolicyRepository,
      mockMailService,
      mockTemplateLoader,
    );
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockOtpRepository.clear();
    mockPolicyRepository.clear();
    mockMailService.clear();
  });

  it('should successfully send OTP if user exists and is verified', async () => {
    const user = UserEntity.create({
      email: 'user@example.edu.vn',
      passwordHash: 'dummy-hash',
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const result = await usecase.execute('user@example.edu.vn');

    expect(result.message).toBe('OTP has been sent to your email.');
    expect(mockMailService.sentEmails.length).toBe(1);
    expect(mockMailService.sentEmails[0].email).toBe('user@example.edu.vn');
  });

  it('should reject if user does not exist', async () => {
    try {
      await usecase.execute('nonexistent@example.edu.vn');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });

  it('should reject if user is not verified', async () => {
    const user = UserEntity.create({
      email: 'unverified@example.edu.vn',
      passwordHash: 'dummy-hash',
      isVerified: false,
    });
    mockUserRepository.addUser({ ...user, id: 'user-2' } as UserEntity);

    try {
      await usecase.execute('unverified@example.edu.vn');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }
  });
});
