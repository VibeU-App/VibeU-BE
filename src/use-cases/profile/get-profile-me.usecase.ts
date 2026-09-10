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
}
