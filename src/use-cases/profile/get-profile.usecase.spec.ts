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

  it('should fail with NotImplemented placeholder error', async () => {
    const birthday = new Date('2000-05-15');
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
      1, // Numeric ID
    );
    await mockProfileRepo.save(profile);

    await expect(useCase.execute('user-1')).rejects.toThrow(
      'Method not implemented.',
    );
  });
});
