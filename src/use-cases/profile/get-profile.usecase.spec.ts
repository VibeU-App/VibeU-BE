import { GetProfileUseCase } from './get-profile.usecase';
import { MockProfileRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockProfileRepo: MockProfileRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    useCase = new GetProfileUseCase(mockProfileRepo);
  });

  it('should return profile with correctly calculated age and Western zodiac sign', async () => {
    const birthday = new Date('2000-05-15'); // May 15 -> Taurus
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      birthday,
      true,
      new Date(),
      new Date(),
      'Harvard University',
      'Coding lover',
      'lotus-id',
    );
    await mockProfileRepo.save(profile);

    const result = await useCase.execute('user-1');

    // Dynamically calculate expected age to prevent test failing in future years
    const today = new Date();
    let expectedAge = today.getFullYear() - 2000;
    const m = today.getMonth() - 4; // May is month 4 (0-indexed)
    if (m < 0 || (m === 0 && today.getDate() < 15)) {
      expectedAge--;
    }

    expect(result.fullName).toBe('Alice');
    expect(result.age).toBe(expectedAge);
    expect(result.zodiac).toBe('Taurus');
    expect(result.university).toBe('Harvard University');
    expect(result.bio).toBe('Coding lover');
  });

  it('should throw an error if profile is not found', async () => {
    await expect(useCase.execute('non-existent')).rejects.toThrow('Profile not found');
  });
});
