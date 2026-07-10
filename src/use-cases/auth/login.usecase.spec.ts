import { LoginUsecase } from './login.usecase';
import { MockUserRepository, MockCryptoService, MockJwtService } from './test-mocks';
import { ErrorCode } from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('LoginUsecase', () => {
  let usecase: LoginUsecase;
  let mockUserRepository: MockUserRepository;
  let mockCryptoService: MockCryptoService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockCryptoService = new MockCryptoService();
    mockJwtService = new MockJwtService();
    usecase = new LoginUsecase(mockUserRepository, mockCryptoService, mockJwtService);
  });

  afterEach(() => {
    mockUserRepository.clear();
  });

  it('should return access token and user data with valid credentials', async () => {
    // TODO: Pre-add verified user
    try {
      await usecase.execute('user@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
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
    try {
      await usecase.execute('user@example.com', 'WrongPass456!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login if user is not verified', async () => {
    // Pre-add an unverified user
    const unverifiedUser = UserEntity.create({
      email: 'unverified@example.com',
      passwordHash: '$2b$10$hashed_SecurePass123!',
      verified: false,
    });
    mockUserRepository.addUser({ ...unverifiedUser, id: 'unverified-user-1' } as UserEntity);

    try {
      await usecase.execute('unverified@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }
  });
});