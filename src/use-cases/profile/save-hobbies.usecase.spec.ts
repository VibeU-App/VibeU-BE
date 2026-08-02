import { SaveHobbiesUseCase } from './save-hobbies.usecase';
import { MockProfileRepository, MockHobbyRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { HobbyEntity } from '../../core/entities/hobby.entity';

describe('SaveHobbiesUseCase', () => {
  let useCase: SaveHobbiesUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockHobbyRepo: MockHobbyRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockHobbyRepo = new MockHobbyRepository();
    useCase = new SaveHobbiesUseCase(mockProfileRepo, mockHobbyRepo);

    // Seed mock hobbies
    mockHobbyRepo.hobbies = [
      new HobbyEntity(1, 'Soccer', 'SPORT', new Date(), new Date()),
      new HobbyEntity(2, 'Cats', 'PET', new Date(), new Date()),
      new HobbyEntity(3, 'Pizza', 'FOOD', new Date(), new Date()),
      new HobbyEntity(
        4,
        'Direct',
        'COMMUNICATION_STYLE',
        new Date(),
        new Date(),
      ),
      new HobbyEntity(5, 'Introverted', 'PERSONALITY', new Date(), new Date()),
    ];
  });

  it('should successfully save hobbies for a valid profile', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    await useCase.execute('user-1', [1, 2, 3]);

    const savedHobbies = await mockHobbyRepo.findProfileHobbies(1);
    expect(savedHobbies.length).toBe(3);
    expect(savedHobbies.map((h) => h.name)).toContain('Soccer');
    expect(savedHobbies.map((h) => h.name)).toContain('Cats');
    expect(savedHobbies.map((h) => h.name)).toContain('Pizza');
  });

  it('should throw an error if profile is not found', async () => {
    await expect(useCase.execute('non-existent', [1, 2, 3])).rejects.toThrow(
      'Profile not found',
    );
  });

  it('should throw an error if selecting less than 3 hobbies', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    await expect(useCase.execute('user-1', [1, 2])).rejects.toThrow(
      'Must select between 3 and 10 hobbies',
    );
  });

  it('should throw an error if selecting more than 10 hobbies', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    await expect(
      useCase.execute('user-1', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    ).rejects.toThrow('Must select between 3 and 10 hobbies');
  });

  it('should throw an error if one or more hobby IDs are invalid', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    await expect(useCase.execute('user-1', [1, 2, 99])).rejects.toThrow(
      'One or more invalid hobby IDs',
    );
  });
});
