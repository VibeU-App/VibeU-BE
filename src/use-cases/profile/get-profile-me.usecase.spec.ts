import { GetProfileMeUseCase } from './get-profile-me.usecase';
import { MockProfileRepository, MockHobbyRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { HobbyEntity } from '../../core/entities/hobby.entity';

describe('GetProfileMeUseCase', () => {
  let useCase: GetProfileMeUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockHobbyRepo: MockHobbyRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockHobbyRepo = new MockHobbyRepository();
    useCase = new GetProfileMeUseCase(mockProfileRepo, mockHobbyRepo);

    mockHobbyRepo.hobbies = [
      new HobbyEntity(1, 'Soccer', 'SPORT', new Date(), new Date()),
    ];
  });

  it('should return profile me dashboard details including hobbies and count statistics', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('1995-12-15'), // Sagittarius
      true,
      new Date(),
      new Date(),
      'Stanford University',
      'Hello!',
      'lotus-id',
    );
    await mockProfileRepo.save(profile);
    await mockHobbyRepo.updateProfileHobbies(1, [1]);

    const result = await useCase.execute('user-1');

    const today = new Date();
    let expectedAge = today.getFullYear() - 1995;
    const m = today.getMonth() - 11; // December is month 11 (0-indexed)
    if (m < 0 || (m === 0 && today.getDate() < 15)) {
      expectedAge--;
    }

    expect(result.fullName).toBe('Alice');
    expect(result.age).toBe(expectedAge);
    expect(result.zodiac).toBe('Sagittarius');
    expect(result.hobbies.length).toBe(1);
    expect(result.hobbies[0].name).toBe('Soccer');
    expect(result.outpostCount).toBe(5);
    expect(result.matchlistCount).toBe(2);
  });

  it('should throw an error if profile is not found', async () => {
    await expect(useCase.execute('non-existent')).rejects.toThrow('Profile not found');
  });
});
