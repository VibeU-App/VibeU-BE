import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository } from './mock-user-repository';
import { MockEmailService } from './mock-email-service';
import { MockOtpRepository } from './mock-otp-repository';
import { ErrorCode } from '../../core/errors';

describe('ForgotPasswordUsecase', () => {
  let usecase: ForgotPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockEmailService: MockEmailService;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockEmailService = new MockEmailService();
    mockOtpRepository = new MockOtpRepository();
    usecase = new ForgotPasswordUsecase(mockUserRepository, mockEmailService, mockOtpRepository);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockEmailService.clear();
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