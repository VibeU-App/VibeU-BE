import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts';
import { ProfileEntity } from '../../core/entities';
import { AppException, ErrorCode } from '../../core/errors';
import { getAge, getZodiacSign } from '../../utils/calculating';

export interface GetProfileMeResult {
  nickname: string;
  avatarSeed: string;
  bio: string | null;
  zodiacSign: string;
  age: number;
  personalityArchetypeId: number | null;
  numOfPosts: number;
  numOfMatches: number;
}

@Injectable()
export class GetProfileMeUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<GetProfileMeResult> {
    const userProfile: ProfileEntity | null =
      await this.profileRepository.findByUserId(userId);

    if (userProfile) {
      const birthday = userProfile.birthday;
      const age = getAge(birthday);
      const zodiac = getZodiacSign(birthday);
      const postAndMatches =
        await this.profileRepository.getProfilePostAndMatchCounts(
          userProfile.id,
        );

      return {
        nickname: userProfile.nickname,
        avatarSeed: userProfile.avatarSeed,
        bio: userProfile.bio,
        zodiacSign: zodiac,
        age: age,
        personalityArchetypeId: userProfile.personalityArchetypeId,
        numOfPosts: postAndMatches.outpostCount,
        numOfMatches: postAndMatches.matchlistCount,
      };
    }

    throw new AppException(ErrorCode.PROFILE_USER_NOT_FOUND);
  }
}
