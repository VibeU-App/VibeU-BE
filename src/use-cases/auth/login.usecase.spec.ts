import { LoginUsecase } from './login.usecase';
import { MockUserRepository, MockCryptoService, MockJwtService, MockSessionRepository } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('LoginUsecase', () => {
  let usecase: LoginUsecase;
  let mockUserRepository: MockUserRepository;
  let mockSessionRepository: MockSessionRepository;
  let mockCryptoService: MockCryptoService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockSessionRepository = new MockSessionRepository();
    mockCryptoService = new MockCryptoService();
    mockJwtService = new MockJwtService();
    usecase = new LoginUsecase(mockUserRepository, mockSessionRepository, mockCryptoService, mockJwtService);
  });

  afterEach(() => {
    mockUserRepository.clear();
    mockSessionRepository.clear();
  });

  it('should return access token and user data with valid credentials', async () => {
    // Pre-add a verified user
    const password = 'SecurePass123!';
    const passwordHash = await mockCryptoService.hash(password);
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash,
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const result = await usecase.execute('user@example.com', password);

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('user@example.com');
  });

  it('should reject login with non-existent email', async () => {
    try {
      await usecase.execute('nonexistent@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login with wrong password', async () => {
    // Pre-add a user
    const passwordHash = await mockCryptoService.hash('CorrectPass123!');
    const user = UserEntity.create({
      email: 'user@example.com',
      passwordHash,
      isVerified: true,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    try {
      await usecase.execute('user@example.com', 'WrongPass456!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login if user is not verified', async () => {
    // Pre-add an unverified user
    const user = UserEntity.create({
      email: 'unverified@example.com',
      passwordHash: await mockCryptoService.hash('SecurePass123!'),
      isVerified: false,
    });
    mockUserRepository.addUser({ ...user, id: 'unverified-user-1' } as UserEntity);

    try {
      await usecase.execute('unverified@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }
  });
});