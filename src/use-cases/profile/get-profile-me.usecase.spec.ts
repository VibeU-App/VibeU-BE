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

  it('should throw NotImplemented placeholder error', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('1995-12-15'),
      true,
      new Date(),
      new Date(),
      'Stanford University',
      'Hello!',
      1, // Numeric ID
    );
    await mockProfileRepo.save(profile);

    await expect(useCase.execute('user-1')).rejects.toThrow('Method not implemented.');
  });
});
