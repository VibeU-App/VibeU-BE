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

  it('should throw NotImplemented placeholder error', async () => {
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
      1, // Numeric ID
    );
    await mockProfileRepo.save(profile);

    const payload = {
      fullName: 'Alice Updated',
      bio: 'New bio',
    };

    await expect(useCase.execute('user-1', payload)).rejects.toThrow('Method not implemented.');
  });
});
