import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { AppException, ErrorCode } from '../../core/errors';
import { getAge } from '../../utils/calculating';

@Injectable()
export class SaveBasicProfileUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    payload: {
      nickname: string;
      gender: string;
      avatarSeed: string;
      birthday: Date;
      university?: string | null;
    },
  ): Promise<ProfileEntity> {
    // Check age
    const age = getAge(payload.birthday);
    if (age < 18) {
      throw new AppException(ErrorCode.PROFILE_USER_NOT_OLD_ENOUGH);
    }

    const existingProfile = await this.profileRepository.findByUserId(userId);

    if (existingProfile) {
      const updatedProfile = new ProfileEntity(
        existingProfile.id,
        existingProfile.userId,
        payload.nickname,
        payload.gender,
        payload.avatarSeed,
        payload.birthday,
        existingProfile.isCompleted,
        existingProfile.createdAt,
        new Date(),
        payload.university !== undefined
          ? payload.university
          : existingProfile.university,
        existingProfile.bio,
        existingProfile.personalityArchetypeId,
      );
      return this.profileRepository.update(updatedProfile);
    } else {
      const newProfile = ProfileEntity.create({
        userId,
        nickname: payload.nickname,
        gender: payload.gender,
        avatarSeed: payload.avatarSeed,
        birthday: payload.birthday,
        university: payload.university,
      });
      return this.profileRepository.save(newProfile);
    }
  }
}
