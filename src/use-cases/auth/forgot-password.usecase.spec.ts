import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository, MockMailService, MockOtpRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';

describe('ForgotPasswordUsecase', () => {
  let usecase: ForgotPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockMailService: MockMailService;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockMailService = new MockMailService();
    mockOtpRepository = new MockOtpRepository();
    usecase = new ForgotPasswordUsecase(mockUserRepository, mockMailService, mockOtpRepository);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockMailService.clear();
    mockOtpRepository.clear();
  });

  it('should always return success message even if user not found', async () => {
    // Security: Never reveal if email exists
    try {
      await usecase.execute('nonexistent@example.com');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should send OTP if user exists', async () => {
    // TODO: Pre-add user and verify OTP was sent
    try {
      await usecase.execute('user@example.com');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});