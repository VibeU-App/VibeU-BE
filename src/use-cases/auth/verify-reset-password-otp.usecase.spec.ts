import { VerifyResetPasswordOtpUsecase } from './verify-reset-password-otp.usecase';
import { MockOtpRepository, MockJwtService, MockUserRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { OtpEntity } from '../../core/entities/otp.entity';
import { UserEntity, UserRole } from '../../core/entities';

describe('VerifyResetPasswordOtpUsecase', () => {
  let usecase: VerifyResetPasswordOtpUsecase;
  let mockOtpRepository: MockOtpRepository;
  let mockJwtService: MockJwtService;
  let mockUserRepository: MockUserRepository;

  beforeEach(() => {
    mockOtpRepository = new MockOtpRepository();
    mockJwtService = new MockJwtService();
    mockUserRepository = new MockUserRepository();
    usecase = new VerifyResetPasswordOtpUsecase(mockOtpRepository, mockJwtService, mockUserRepository);
  });

  afterEach(() => {
    mockOtpRepository.clear();
    mockUserRepository.clear();
  });

  it('should return reset token with valid OTP', async () => {
    const validOtp = OtpEntity.create({
      userId: 'user-123',
      code: '123456',
      expiryMinutes: 10,
    });
    mockOtpRepository.addOtp(validOtp);

    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )
    mockUserRepository.addUser(testUser);

    const testResult = await usecase.execute('user@example.edu', '123456');

    expect(mockJwtService.verifyToken(testResult.resetToken)).toEqual({
      sub: testUser.id,
      email: testUser.email,
      role: 'user',
    });
  });

  it('should reject invalid OTP', async () => {
    const validOtp = OtpEntity.create({
      userId: 'user-123',
      code: '123456',
      expiryMinutes: 10,
    });
    mockOtpRepository.addOtp(validOtp);

    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )
    mockUserRepository.addUser(testUser);

    try {
      await usecase.execute('user@example.edu', '000000');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getResponse().code).toBe(ErrorCode.AUTH_OTP_INVALID);
    }
  });

  it('should reject expired OTP', async () => {
    const expiredOtp = OtpEntity.create({
      userId: 'user-123',
      code: '999999',
      expiryMinutes: -1, // Already expired
    });
    mockOtpRepository.addOtp(expiredOtp);

    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )
    mockUserRepository.addUser(testUser);

    try {
      await usecase.execute('user@example.edu', '999999');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getResponse().code).toBe(ErrorCode.AUTH_OTP_EXPIRED);
    }
  });
});
