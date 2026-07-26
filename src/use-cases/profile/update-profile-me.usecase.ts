import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { ErrorCode } from '../../core';

@Injectable()
export class UpdateProfileMeUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    payload: {
      nickname?: string;
      birthday?: Date;
      bio?: string | null;
      avatarSeed?: string;
      university?: string | null;
    },
  ): Promise<ProfileEntity> {
    const userProfile: ProfileEntity | null = await this.profileRepository.findByUserId(userId);

    if (!!userProfile) {
      if (!!payload.birthday && this.profileRepository.getAge(payload.birthday) < 18) {
        throw new BadRequestException({
          code: ErrorCode.PROFILE_USER_NOT_OLD_ENOUGH,
          message: "User must be 18 or older",
        })
      }

      const newProfile = new ProfileEntity(
        userProfile.id,
        userId,
        payload.nickname ?? userProfile.nickname,
        userProfile.gender,
        payload.avatarSeed ?? userProfile.avatarSeed,
        payload.birthday ?? userProfile.birthday,
        userProfile.isCompleted,
        userProfile.createdAt,
        new Date(),
        payload.university ?? userProfile.university,
        payload.bio ?? userProfile.bio,
        userProfile.personalityArchetypeId,
      )
      
      await this.profileRepository.update(newProfile);

      return newProfile;
    }

    throw new BadRequestException({
      code: ErrorCode.PROFILE_USER_NOT_FOUND,
      message: "User not found",
    });
  }
}
