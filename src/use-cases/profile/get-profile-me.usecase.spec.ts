import { GetProfileMeUseCase } from './get-profile-me.usecase';
import { MockProfileRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';

describe('GetProfileMeUseCase', () => {
  let useCase: GetProfileMeUseCase;
  let mockProfileRepo: MockProfileRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    useCase = new GetProfileMeUseCase(mockProfileRepo);
  });

  it('should return profile with correct information', async () => {
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

    expect(await useCase.execute('user-1')).toEqual({
      nickname: 'Alice',
      avatarSeed: 'seed',
      bio: 'Hello!',
      zodiacSign: 'Sagittarius',
      age: expect.any(Number),
      personalityArchetypeId: 1,
      numOfPosts: 5,
      numOfMatches: 2,
    });
  });
});
