import { LoginUsecase } from './login.usecase';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors';

describe('LoginUsecase', () => {
  let usecase: LoginUsecase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    usecase = new LoginUsecase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should return access token and user data with valid credentials', async () => {
    const email = 'user@example.com';
    const password = 'SecurePass123!';

    const existingUser = UserEntity.create({
      email,
      passwordHash: '$2b$10$validhash',
    });
    mockRepository.addUser(existingUser);

    const result = await usecase.execute(email, password);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe('string');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(email);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('should reject login with non-existent email', async () => {
    const email = 'nonexistent@example.com';
    const password = 'SecurePass123!';

    try {
      await usecase.execute(email, password);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });

  it('should reject login with wrong password', async () => {
    const email = 'user@example.com';
    const wrongPassword = 'WrongPass456!';

    const existingUser = UserEntity.create({
      email,
      passwordHash: '$2b$10$validhash',
    });
    mockRepository.addUser(existingUser);

    try {
      await usecase.execute(email, wrongPassword);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
  });
});