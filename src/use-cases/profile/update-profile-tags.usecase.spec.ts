import { UpdateProfileTagsUseCase } from './update-profile-tags.usecase';
import { MockProfileRepository, MockHobbyRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { HobbyEntity } from '../../core/entities/hobby.entity';

describe('UpdateProfileTagsUseCase', () => {
  let useCase: UpdateProfileTagsUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockHobbyRepo: MockHobbyRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockHobbyRepo = new MockHobbyRepository();
    useCase = new UpdateProfileTagsUseCase(mockProfileRepo, mockHobbyRepo);

    mockHobbyRepo.hobbies = [
      new HobbyEntity(1, 'Soccer', 'SPORT', new Date(), new Date()),
      new HobbyEntity(2, 'Cats', 'PET', new Date(), new Date()),
      new HobbyEntity(3, 'Pizza', 'FOOD', new Date(), new Date()),
    ];
  });

  it('should successfully update tag associations for profile', async () => {
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

    await useCase.execute('user-1', [1, 2, 3]);

    const result = await mockHobbyRepo.findProfileHobbies(1);
    expect(result.length).toBe(3);
  });
});
