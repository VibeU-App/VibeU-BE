import { SaveBasicProfileUseCase } from './save-basic-profile.usecase';
import { MockProfileRepository } from './test-mocks';

describe('SaveBasicProfileUseCase', () => {
  let useCase: SaveBasicProfileUseCase;
  let mockProfileRepo: MockProfileRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    useCase = new SaveBasicProfileUseCase(mockProfileRepo);
  });

  it('should successfully create a new basic profile', async () => {
    const payload = {
      nickname: 'Alice Johnson',
      gender: 'Female',
      avatarSeed: 'seed123',
      birthday: new Date('2000-01-01'),
      university: 'Hanoi University',
    };

    const result = await useCase.execute('user-1', payload);

    expect(result.id).toBe(1);
    expect(result.userId).toBe('user-1');
    expect(result.nickname).toBe('Alice Johnson');
    expect(result.gender).toBe('Female');
    expect(result.university).toBe('Hanoi University');
    expect(result.isCompleted).toBe(false);
  });

  it('should throw an error if age is less than 18', async () => {
    const payload = {
      nickname: 'Bob Junior',
      gender: 'Male',
      avatarSeed: 'seed321',
      birthday: new Date(new Date().getFullYear() - 15, 1, 1), // 15 years old
    };

    await expect(useCase.execute('user-2', payload)).rejects.toThrow(
      'User must be at least 18 years old',
    );
  });

  it('should successfully update an existing profile instead of creating a new one', async () => {
    const payload = {
      nickname: 'Alice Johnson',
      gender: 'Female',
      avatarSeed: 'seed123',
      birthday: new Date('2000-01-01'),
      university: 'Hanoi University',
    };

    await useCase.execute('user-1', payload);

    // Update
    const updatedPayload = {
      nickname: 'Alice J.',
      gender: 'Female',
      avatarSeed: 'newseed',
      birthday: new Date('2000-01-01'),
      university: 'FPT University',
    };

    const updatedResult = await useCase.execute('user-1', updatedPayload);

    expect(updatedResult.id).toBe(1);
    expect(updatedResult.nickname).toBe('Alice J.');
    expect(updatedResult.university).toBe('FPT University');
    expect(updatedResult.avatarSeed).toBe('newseed');
  });
});
