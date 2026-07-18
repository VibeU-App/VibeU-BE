import { ChangePasswordUsecase } from './change-password.usecase';
import { MockUserRepository, MockCryptoService } from './test-mocks';
import { UserEntity } from '../../core/entities/user.entity';

describe('ChangePasswordUsecase', () => {
  let usecase: ChangePasswordUsecase;
  let mockUserRepository: MockUserRepository;
  let mockCryptoService: MockCryptoService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockCryptoService = new MockCryptoService();
    usecase = new ChangePasswordUsecase(mockUserRepository, mockCryptoService);
  });

  afterEach(() => {
    mockUserRepository.clear();
  });

  it('should successfully change a password if old password matches', async () => {
    const oldPasswordHash = await mockCryptoService.hash('OldSecurePass123!');
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: oldPasswordHash,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    const result = await usecase.execute('user-1', 'OldSecurePass123!', 'NewSecurePass123!');
    expect(result.message).toBe('Password changed successfully.');

    const updatedUser = await mockUserRepository.findById('user-1');
    expect(updatedUser?.passwordHash).not.toBe(oldPasswordHash);
    expect(updatedUser?.passwordHash).toContain('hashed_NewSecurePass123!');
  });

  it('should throw an error if old password does not match', async () => {
    const oldPasswordHash = await mockCryptoService.hash('OldSecurePass123!');
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: oldPasswordHash,
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    await expect(usecase.execute('user-1', 'IncorrectPass123!', 'NewSecurePass123!')).rejects.toThrow();
  });

  it('should throw an error if user does not have a password set yet', async () => {
    const user = UserEntity.create({
      email: 'user@example.edu',
      passwordHash: '',
    });
    mockUserRepository.addUser({ ...user, id: 'user-1' } as UserEntity);

    await expect(usecase.execute('user-1', 'SomeOldPass!', 'NewSecurePass123!')).rejects.toThrow();
  });
});
