import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../core/entities';
import { AppException, ErrorCode } from '../../core';

@Injectable()
export class GetProfileMeUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<any> {
    const userProfile: ProfileEntity | null =
      await this.profileRepository.findByUserId(userId);

    if (userProfile) {
      const birthday = userProfile.birthday;
      const age = this.profileRepository.getAge(birthday);
      const zodiac: string = this.profileRepository.getZodiacSign(birthday);
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
