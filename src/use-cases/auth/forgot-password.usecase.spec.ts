import { ForgotPasswordUsecase } from './forgot-password.usecase';
import { MockUserRepository } from './mock-user-repository';
import { UserEntity } from '../../core/entities/user.entity';
import { ErrorCode } from '../../core/errors';

describe('ForgotPasswordUsecase', () => {
  let usecase: ForgotPasswordUsecase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    usecase = new ForgotPasswordUsecase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should send OTP for existing user', async () => {
    const email = 'user@example.com';

    const existingUser = UserEntity.create({
      email,
      passwordHash: 'hashed-password',
    });
    mockRepository.addUser(existingUser);

    const result = await usecase.execute(email);

    expect(result.message).toBeDefined();
  });

  it('should reject if user not found', async () => {
    const email = 'nonexistent@example.com';

    try {
      await usecase.execute(email);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    }
  });
});