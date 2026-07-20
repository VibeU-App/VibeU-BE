import { UpdateProfileMeUseCase } from './update-profile-me.usecase';
import { MockProfileRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';

describe('UpdateProfileMeUseCase', () => {
  let useCase: UpdateProfileMeUseCase;
  let mockProfileRepo: MockProfileRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    useCase = new UpdateProfileMeUseCase(mockProfileRepo);
  });

  it('should successfully update editable profile fields', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      true,
      new Date(),
      new Date(),
      'Stanford',
      'Bio',
      'lotus-id',
    );
    await mockProfileRepo.save(profile);

    const payload = {
      fullName: 'Alice Updated',
      bio: 'New bio',
      university: 'MIT',
      avatarSeed: 'newseed',
    };

    const result = await useCase.execute('user-1', payload);

    expect(result.fullName).toBe('Alice Updated');
    expect(result.bio).toBe('New bio');
    expect(result.university).toBe('MIT');
    expect(result.avatarSeed).toBe('newseed');
    expect(result.gender).toBe('Female'); // Unchanged
    expect(result.personalityArchetypeId).toBe('lotus-id'); // Unchanged
  });

  it('should throw an error if update contains age under 18', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      true,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    const payload = {
      birthday: new Date(new Date().getFullYear() - 10, 1, 1), // 10 years old
    };

    await expect(useCase.execute('user-1', payload)).rejects.toThrow(
      'User must be at least 18 years old',
    );
  });
});
