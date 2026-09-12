import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository, IHobbyRepository } from '../../core/abstracts';
import { ProfileEntity } from '../../core/entities';
import { ProfileTagDto } from '../../core/dtos';

@Injectable()
export class GetProfileTagsUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
  ) {}

  async execute(userId: string): Promise<ProfileTagDto[]> {
    let userProfile: ProfileEntity | null =
      await this.profileRepository.findByUserId(userId);

    if (!userProfile) {
      const defaultNickname = `user_${userId.substring(0, 8)}`;
      const blankProfile = ProfileEntity.create({
        userId,
        nickname: defaultNickname,
        gender: 'OTHER',
        avatarSeed: defaultNickname,
        birthday: new Date('2000-01-01T00:00:00.000Z'),
      });
      userProfile = await this.profileRepository.save(blankProfile);
    }

    const hobbies = await this.hobbyRepository.findProfileHobbies(
      userProfile.id,
    );

    return hobbies.map((h) => ({
      id: h.id,
      name: h.name,
      category: h.category,
    }));
  }
}
