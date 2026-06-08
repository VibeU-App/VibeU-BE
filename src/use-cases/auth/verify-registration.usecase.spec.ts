import { VerifyRegistrationUsecase } from './verify-registration.usecase';
import { MockUserRepository } from './mock-user-repository';
import { MockOtpRepository } from './mock-otp-repository';
import { ErrorCode } from '../../core/errors';

describe('VerifyRegistrationUsecase', () => {
  let usecase: VerifyRegistrationUsecase;
  let mockUserRepository: MockUserRepository;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockOtpRepository = new MockOtpRepository();
    usecase = new VerifyRegistrationUsecase(mockUserRepository, mockOtpRepository);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockOtpRepository.clear();
  });

  it('should verify user with valid OTP', async () => {
    // TODO: Pre-add user and valid OTP
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
    // TODO: Pre-add expired OTP
    try {
      await usecase.execute('user@example.com', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });

  it('should reject if user not found', async () => {
    try {
      await usecase.execute('nonexistent@example.com', '123456');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });
});