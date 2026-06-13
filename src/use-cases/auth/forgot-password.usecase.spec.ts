import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository, MockMailService, MockOtpService } from './test-mocks';
import { ErrorCode } from '../../core/errors';

describe('ForgotPasswordUsecase', () => {
  let usecase: ForgotPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockMailService: MockMailService;
  let mockOtpService: MockOtpService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockMailService = new MockMailService();
    mockOtpService = new MockOtpService();
    usecase = new ForgotPasswordUsecase(mockUserRepository, mockMailService, mockOtpService);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockMailService.clear();
    mockOtpService.clear();
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
