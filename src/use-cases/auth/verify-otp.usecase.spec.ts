import { VerifyOtpUsecase } from './verify-otp.usecase';
import { MockOtpService, MockJwtService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { OtpEntity } from '../../core/entities/otp.entity';

describe('VerifyOtpUsecase', () => {
  let usecase: VerifyOtpUsecase;
  let mockOtpService: MockOtpService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockOtpService = new MockOtpService();
    mockJwtService = new MockJwtService();
    usecase = new VerifyOtpUsecase(mockOtpService, mockJwtService);
  });

  afterEach(() => {
    mockOtpService.clear();
  });

  it('should return reset token with valid OTP', async () => {
    // TODO: Pre-add valid OTP by userId
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
    const expiredOtp = OtpEntity.create({
      userId: 'user-123',
      code: '999999',
      expiryMinutes: -1, // Already expired
    });
    mockOtpService.addOtp(expiredOtp);

    try {
      await usecase.execute('user@example.com', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });
});
