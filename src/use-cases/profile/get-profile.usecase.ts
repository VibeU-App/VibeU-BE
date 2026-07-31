import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';
import { IPersonalityArchetypeRepository } from '../../core/abstracts/personality-archetype-repository.interface';

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

  async execute(userId: string): Promise<any> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const hobbies = await this.hobbyRepository.findProfileHobbies(profile.id);
    let archetype: unknown = null;
    if (profile.personalityArchetypeId) {
      archetype = await this.archetypeRepository.findById(
        profile.personalityArchetypeId,
      );
    }

    const stats = await this.profileRepository.getProfilePostAndMatchCounts(
      profile.id,
    );

    const now = new Date();
    let age = now.getFullYear() - profile.birthday.getFullYear();
    const m = now.getMonth() - profile.birthday.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < profile.birthday.getDate())) {
      age--;
    }

    const zodiac = this.getZodiac(profile.birthday);

    return {
      profile,
      hobbies,
      archetype,
      stats,
      age,
      zodiac,
    };
  }

  private getZodiac(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return 'Aquarius';
    return 'Pisces';
  }
}
