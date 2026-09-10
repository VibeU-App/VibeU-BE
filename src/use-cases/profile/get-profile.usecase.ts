import { Inject, Injectable } from '@nestjs/common';
import {
  IProfileRepository,
  IHobbyRepository,
  IPersonalityArchetypeRepository,
} from '../../core/abstracts';
import {
  ProfileEntity,
  HobbyEntity,
  PersonalityArchetypeEntity,
} from '../../core/entities';
import { AppException, ErrorCode } from '../../core/errors';
import { getAge, getZodiacSign } from '../../utils/calculating';

export interface GetProfileResult {
  profile: ProfileEntity;
  hobbies: HobbyEntity[];
  archetype: PersonalityArchetypeEntity | null;
  stats: { outpostCount: number; matchlistCount: number };
  age: number;
  zodiac: string;
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
    @Inject('IPersonalityArchetypeRepository')
    private readonly archetypeRepository: IPersonalityArchetypeRepository,
  ) {}

  async execute(userId: string): Promise<GetProfileResult> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppException(ErrorCode.PROFILE_USER_NOT_FOUND);
    }

    const hobbies = await this.hobbyRepository.findProfileHobbies(profile.id);
    let archetype: PersonalityArchetypeEntity | null = null;
    if (profile.personalityArchetypeId) {
      archetype = await this.archetypeRepository.findById(
        profile.personalityArchetypeId,
      );
    }

    const stats = await this.profileRepository.getProfilePostAndMatchCounts(
      profile.id,
    );

    const age = getAge(profile.birthday);
    const zodiac = getZodiacSign(profile.birthday);

    return {
      profile,
      hobbies,
      archetype,
      stats,
      age,
      zodiac,
    };
  }
}
