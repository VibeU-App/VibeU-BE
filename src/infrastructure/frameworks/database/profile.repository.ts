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
        fullName: profile.fullName,
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
        fullName: profile.fullName,
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

  async getProfilePostAndMatchCounts(profileId: number): Promise<{ outpostCount: number; matchlistCount: number }> {
    // These will be aggregated from other schemas. Temporarily return mocks to avoid compile errors.
    return {
      outpostCount: 0,
      matchlistCount: 0,
    };
  }

  private mapToEntity(prismaProfile: PrismaProfile): ProfileEntity {
    return new ProfileEntity(
      prismaProfile.id,
      prismaProfile.userId,
      prismaProfile.fullName,
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
