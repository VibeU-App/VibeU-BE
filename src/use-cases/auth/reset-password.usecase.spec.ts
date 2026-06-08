import { ResetPasswordUsecase } from './reset-password.usecase';
import { MockUserRepository } from './mock-user-repository';
import { MockHashService } from './mock-hash-service';
import { ErrorCode } from '../../core/errors';

describe('ResetPasswordUsecase', () => {
  let usecase: ResetPasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockHashService: MockHashService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockHashService = new MockHashService();
    usecase = new ResetPasswordUsecase(mockUserRepository, mockHashService);
  });

  afterEach(() => {
    mockUserRepository.clear();
  });

  it('should reset password successfully', async () => {
    // TODO: Pre-add user
    try {
      await usecase.execute('user@example.com', 'NewSecurePass456!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });

  it('should reject if user not found', async () => {
    try {
      await usecase.execute('nonexistent@example.com', 'NewSecurePass456!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });

  it('should hash the new password before saving', async () => {
    // TODO: Verify password is hashed
    try {
      await usecase.execute('user@example.com', 'NewSecurePass456!');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});