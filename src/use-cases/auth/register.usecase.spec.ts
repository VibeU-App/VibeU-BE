import { RegisterUsecase } from './register.usecase';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity, UserRole } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors';

describe('RegisterUsecase', () => {
  let usecase: RegisterUsecase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    usecase = new RegisterUsecase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should register a new user with valid email and password', async () => {
    const email = 'test@example.com';
    const password = 'SecurePass123!';

    const result = await usecase.execute(email, password);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(email.toLowerCase());
    expect(result.user.role).toBe(UserRole.USER);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('should reject registration with duplicate email', async () => {
    const email = 'existing@example.com';
    const password = 'SecurePass123!';

    const existingUser = UserEntity.create({
      email,
      passwordHash: 'hashed-password',
    });
    mockRepository.addUser(existingUser);

    try {
      await usecase.execute(email, password);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
  });

  it('should normalize email to lowercase', async () => {
    const email = 'Test@Example.COM';
    const password = 'SecurePass123!';

    const result = await usecase.execute(email, password);

    expect(result.user.email).toBe('test@example.com');
  });
});