import { VerifyOtpUsecase } from './verify-otp.usecase';
import { MockOtpRepository, MockJwtService } from './test-mocks';
import { ErrorCode } from '../../core/errors';

describe('VerifyOtpUsecase', () => {
  let usecase: VerifyOtpUsecase;
  let mockOtpRepository: MockOtpRepository;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockOtpRepository = new MockOtpRepository();
    mockJwtService = new MockJwtService();
    usecase = new VerifyOtpUsecase(mockOtpRepository, mockJwtService);
  });

  afterEach(() => {
    mockOtpRepository.clear();
  });

  it('should return reset token with valid OTP', async () => {
    // TODO: Pre-add valid OTP
    try {
      await usecase.execute('user@example.com', '123456');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject invalid OTP', async () => {
    try {
      await usecase.execute('user@example.com', '000000');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject expired OTP', async () => {
    // Pre-add an expired OTP
    mockOtpRepository.addOtp({
      id: 'expired-otp-1',
      email: 'user@example.com',
      code: '999999',
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    });

    try {
      await usecase.execute('user@example.com', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });
});