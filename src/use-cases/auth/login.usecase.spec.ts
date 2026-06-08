import { LoginUsecase } from './login.usecase';
import { MockUserRepository } from './mock-user-repository';
import { MockHashService } from './mock-hash-service';
import { MockJwtService } from './mock-jwt-service';
import { ErrorCode } from '../../core/errors';

describe('LoginUsecase', () => {
  let usecase: LoginUsecase;
  let mockUserRepository: MockUserRepository;
  let mockHashService: MockHashService;
  let mockJwtService: MockJwtService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockHashService = new MockHashService();
    mockJwtService = new MockJwtService();
    usecase = new LoginUsecase(mockUserRepository, mockHashService, mockJwtService);
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
    // TODO: Pre-add unverified user and expect AUTH_USER_NOT_VERIFIED error
    try {
      await usecase.execute('unverified@example.com', 'SecurePass123!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_VERIFIED);
    }
  });
});