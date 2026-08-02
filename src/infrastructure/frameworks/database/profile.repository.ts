import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../../core/abstracts/profile-repository.interface';
import { ProfileEntity } from '../../../core/entities/profile.entity';
import { PrismaService } from './prisma.service';
import { Profile as PrismaProfile } from '@prisma/client';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return this.mapToEntity(profile);
  }

  async findById(id: number): Promise<ProfileEntity | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) return null;
    return this.mapToEntity(profile);
  }

  async save(profile: ProfileEntity): Promise<ProfileEntity> {
    const created = await this.prisma.profile.create({
      data: {
        userId: profile.userId,
        nickname: profile.nickname,
        gender: profile.gender,
        university: profile.university,
        bio: profile.bio,
        avatarSeed: profile.avatarSeed,
        birthday: profile.birthday,
        personalityArchetypeId: profile.personalityArchetypeId,
        isCompleted: profile.isCompleted,
      },
    });
    return this.mapToEntity(created);
  }

  async update(profile: ProfileEntity): Promise<ProfileEntity> {
    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        nickname: profile.nickname,
        gender: profile.gender,
        university: profile.university,
        bio: profile.bio,
        avatarSeed: profile.avatarSeed,
        birthday: profile.birthday,
        personalityArchetypeId: profile.personalityArchetypeId,
        isCompleted: profile.isCompleted,
      },
    });
    return this.mapToEntity(updated);
  }

  async getProfilePostAndMatchCounts(
    profileId: number,
  ): Promise<{ outpostCount: number; matchlistCount: number }> {
    return {
      outpostCount: 0,
      matchlistCount: 0,
    };
  }

  getAge(birthday: Date): number {
    const currentDate = new Date();
    let age = currentDate.getUTCFullYear() - birthday.getUTCFullYear();

    if (
      currentDate.getUTCMonth() - birthday.getUTCMonth() < 0 ||
      (currentDate.getUTCMonth() - birthday.getUTCMonth() === 0 &&
        currentDate.getUTCDate() - birthday.getUTCDate() < 0)
    ) {
      age--;
    }

    return age;
  }

  getZodiacSign(birthday: Date): string {
    const zodiacSignsMap = [
      'Aquarius',
      'Pisces',
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
    ];

    const zodiacDayMap = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];

    const birthMonth = birthday.getUTCMonth();
    const birthDate = birthday.getUTCDate();

    if (birthDate < zodiacDayMap[birthMonth]) {
      if (birthMonth === 0) {
        return zodiacSignsMap[11];
      } else {
        return zodiacSignsMap[birthMonth - 1];
      }
    } else {
      return zodiacSignsMap[birthMonth];
    }
  }

  private mapToEntity(prismaProfile: PrismaProfile): ProfileEntity {
    return new ProfileEntity(
      prismaProfile.id,
      prismaProfile.userId,
      prismaProfile.nickname,
      prismaProfile.gender,
      prismaProfile.avatarSeed,
      prismaProfile.birthday,
      prismaProfile.isCompleted,
      prismaProfile.createdAt,
      prismaProfile.updatedAt,
      prismaProfile.university,
      prismaProfile.bio,
      prismaProfile.personalityArchetypeId,
    );
  }
}
