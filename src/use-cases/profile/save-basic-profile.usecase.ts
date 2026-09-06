import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';

@Injectable()
export class SaveBasicProfileUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    payload: {
      fullName: string;
      gender: string;
      avatarSeed: string;
      birthday: Date;
      university?: string | null;
    },
  ): Promise<ProfileEntity> {
    // Check age
    const now = new Date();
    let age = now.getFullYear() - payload.birthday.getFullYear();
    const m = now.getMonth() - payload.birthday.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < payload.birthday.getDate())) {
      age--;
    }
    if (age < 18) {
      throw new Error('User must be at least 18 years old');
    }

    const existingProfile = await this.profileRepository.findByUserId(userId);

    if (existingProfile) {
      const updatedProfile = new ProfileEntity(
        existingProfile.id,
        existingProfile.userId,
        payload.fullName,
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
        fullName: payload.fullName,
        gender: payload.gender,
        avatarSeed: payload.avatarSeed,
        birthday: payload.birthday,
        university: payload.university,
      });
      return this.profileRepository.save(newProfile);
    }
  }
}
