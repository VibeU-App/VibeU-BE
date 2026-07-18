import { CreatePasswordUsecase } from './create-password.usecase';
import { MockUserRepository, MockCryptoService } from './test-mocks';
import { UserEntity } from '../../core/entities/user.entity';

describe('CreatePasswordUsecase', () => {
  let usecase: CreatePasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockCryptoService: MockCryptoService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockCryptoService = new MockCryptoService();
    usecase = new CreatePasswordUsecase(mockUserRepository, mockCryptoService);
  });

  afterEach(() => {
    mockUserRepository.clear();
  });

  it('should successfully create a password if it has not been set yet', async () => {
    // Pre-add user with no password hash
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: '',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const result = await usecase.execute('user-1', 'SecurePass123!');
    expect(result.message).toBe('Password created successfully.');

    const updatedUser = await mockUserRepository.findById('user-1');
    expect(updatedUser?.passwordHash).not.toBe('');
    expect(updatedUser?.passwordHash).toContain('hashed_SecurePass123!');
  });

  it('should throw an error if user already has a password set', async () => {
    // Pre-add user with existing password hash
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: 'hashed_ExistingPassword123!',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    await expect(usecase.execute('user-1', 'NewSecurePass123!')).rejects.toThrow();
  });
});
