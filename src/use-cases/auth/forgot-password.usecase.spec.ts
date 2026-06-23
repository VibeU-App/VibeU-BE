import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository, MockMailService, MockOtpService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities';

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
    const testResult = await usecase.execute('nonexistent@example.com');

    expect(testResult.message).toBe("If that email is registered, an OTP has been sent.");
  });

  it('should send OTP if user exists', async () => {
    const user : UserEntity = UserEntity.create({
      email: "user@example.com",
      passwordHash: "i3hr92hr9ebfusboc",
    });

    mockUserRepository.addUser(user);

    await usecase.execute('user@example.com');
    
    // Verify that an email is sent
    expect(mockMailService.sentEmails.length).toBe(1);

    // Verify that the email is sent to the right user
    expect(mockMailService.sentEmails[0].email).toEqual(user.email);

    // Verify that the OTP is truthy
    expect(mockMailService.sentEmails[0].otp).toBeTruthy();
  });
});
