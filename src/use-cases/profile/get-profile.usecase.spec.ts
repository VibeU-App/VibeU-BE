import { GetProfileUseCase } from './get-profile.usecase';
import {
  MockProfileRepository,
  MockHobbyRepository,
  MockPersonalityArchetypeRepository,
} from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockHobbyRepo: MockHobbyRepository;
  let mockArchetypeRepo: MockPersonalityArchetypeRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockHobbyRepo = new MockHobbyRepository();
    mockArchetypeRepo = new MockPersonalityArchetypeRepository();
    useCase = new GetProfileUseCase(
      mockProfileRepo,
      mockHobbyRepo,
      mockArchetypeRepo,
    );
  });

  it('should return profile data for a given user id', async () => {
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

    const result = await useCase.execute('user-1');
    expect(result.profile.userId).toBe('user-1');
  });
});
