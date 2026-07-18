import { ResetPasswordUsecase } from './reset-password.usecase';
import { MockUserRepository, MockCryptoService, MockJwtService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity, UserRole } from '../../core/entities';

describe('ResetPasswordUsecase', () => {
  let usecase: ResetPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockCryptoService: MockCryptoService;
  let mockJwtService: MockJwtService;

  const mockToken = {
    sub: 'user-123',
    email: 'user@example.edu',
    role: 'user',
  }

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockCryptoService = new MockCryptoService();
    mockJwtService = new MockJwtService();
    usecase = new ResetPasswordUsecase(mockUserRepository, mockCryptoService, mockJwtService);
  });

  afterEach(() => {
    mockUserRepository.clear();
  });

  it('should reset password successfully', async () => {
    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )

    mockUserRepository.addUser(testUser);
    const testToken = mockJwtService.signPayload(mockToken);

    const newPass = "NewSecurePass456!";
    await usecase.execute(newPass, testToken);
    const newPassHash = await mockCryptoService.hash(newPass);

    expect((await mockUserRepository.findById(testUser.id))?.passwordHash).toBe(newPassHash);
  });

  it('should reject if user not found', async () => {
    try {
      await usecase.execute('NewSecurePass456!', 'random');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getResponse().code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });

  it('should hash the new password before saving', async () => {
    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )

    mockUserRepository.addUser(testUser);
    const testToken = mockJwtService.signPayload(mockToken);

    const newPass = "NewSecurePass456!";
    await usecase.execute(newPass, testToken);

    expect(testUser.passwordHash).not.toBe(newPass);
  });

  it('should reject weak passwords', async () => {
    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', 'Examplepassword123!', '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )

    mockUserRepository.addUser(testUser);
    const testToken = mockJwtService.signPayload(mockToken);
    
    try {
      await usecase.execute("weakpassword", testToken);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getResponse().code).toBe(ErrorCode.AUTH_WEAK_PASSWORD);
    }
  });

  it('should reject new password matching old password', async () => {
    const passwordHash = await mockCryptoService.hash('Examplepassword123!');
    const testUser : UserEntity = new UserEntity(
      'user-123', 'user@example.edu', passwordHash, '0',
      UserRole.USER,
      false, new Date(Date.now()), new Date(Date.now()), null,
    )

    mockUserRepository.addUser(testUser);
    const testToken = mockJwtService.signPayload(mockToken);
    
    try {
      await usecase.execute("Examplepassword123!", testToken);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getResponse().code).toBe(ErrorCode.AUTH_MATCHING_OLD_PASSWORD);
    }
  });
});