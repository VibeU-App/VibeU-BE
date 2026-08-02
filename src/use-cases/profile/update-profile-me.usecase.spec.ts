import { UpdateProfileMeUseCase } from './update-profile-me.usecase';
import { MockProfileRepository } from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProfileRequestDto } from '../../core/dtos/profile/update-profile.dto';
import { HttpStatus } from '@nestjs/common';

describe('UpdateProfileMeUseCase', () => {
  let useCase: UpdateProfileMeUseCase;
  let mockProfileRepo: MockProfileRepository;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    useCase = new UpdateProfileMeUseCase(mockProfileRepo);
  });

  it('should successfully update a profile with correct information', async () => {
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

    const payload = {
      nickname: 'Alice Updated',
      bio: 'New bio',
      university: 'Ton Duc Thang University',
    };

    await useCase.execute('user-1', payload);

    expect(await mockProfileRepo.findByUserId('user-1')).toEqual({
      id: 1,
      userId: 'user-1',
      nickname: 'Alice Updated',
      gender: 'Female',
      avatarSeed: 'seed',
      birthday: expect.any(Date),
      isCompleted: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      university: 'Ton Duc Thang University',
      bio: 'New bio',
      personalityArchetypeId: 1,
    });
  });

  it('should reject if name is too short', async () => {
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

    const payload = {
      nickname: 'a',
    };

    const newProfile = await useCase.execute('user-1', payload);
    const dto = plainToInstance(UpdateProfileRequestDto, newProfile);
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('nickname');
  });

  it('should reject if user is younger than 18', async () => {
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

    const payload = {
      birthday: new Date('2020-10-10'),
    };

    try {
      await useCase.execute('user-1', payload);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });
});
