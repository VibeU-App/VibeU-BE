import { GetProfileTagsUseCase } from './get-profile-tags.usecase';
import { MockProfileRepository, MockHobbyRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { HobbyEntity } from '../../core/entities/hobby.entity';

describe('GetProfileTagsUseCase', () => {
  let useCase: GetProfileTagsUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockHobbyRepo: MockHobbyRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockHobbyRepo = new MockHobbyRepository();
    useCase = new GetProfileTagsUseCase(mockProfileRepo, mockHobbyRepo);
  });

  it("should return the user's selected tags", async () => {
    // 1. Create and save profile
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'avatar-seed',
      new Date('2000-01-01'),
      true,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    // 2. Setup hobbies in repository
    const hobby1 = new HobbyEntity(1, 'Soccer', 'SPORT');
    const hobby2 = new HobbyEntity(2, 'Introverted', 'PERSONALITY');
    mockHobbyRepo.hobbies = [hobby1, hobby2];

    // 3. Associate hobbies with profile
    await mockHobbyRepo.updateProfileHobbies(1, [1, 2]);

    const result = await useCase.execute('user-1');
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { id: 1, name: 'Soccer', category: 'SPORT' },
      { id: 2, name: 'Introverted', category: 'PERSONALITY' },
    ]);
  });

  it('should return an empty array if the user has no selected tags', async () => {
    const profile = new ProfileEntity(
      2,
      'user-2',
      'Bob',
      'Male',
      'avatar-seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    const result = await useCase.execute('user-2');
    expect(result).toEqual([]);
  });

  it('should auto-create a blank profile and return empty tags if profile does not exist yet', async () => {
    const result = await useCase.execute('non-existent-user');
    expect(result).toEqual([]);

    const created = await mockProfileRepo.findByUserId('non-existent-user');
    expect(created).toBeDefined();
    expect(created?.userId).toBe('non-existent-user');
  });
});
