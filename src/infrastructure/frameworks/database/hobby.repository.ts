import { Injectable } from '@nestjs/common';
import { IHobbyRepository } from '../../../core/abstracts/hobby-repository.interface';
import { HobbyEntity } from '../../../core/entities/hobby.entity';
import { PrismaService } from './prisma.service';
import { Hobby as PrismaHobby } from '@prisma/client';

@Injectable()
export class PrismaHobbyRepository implements IHobbyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<HobbyEntity[]> {
    const list = await this.prisma.hobby.findMany();
    return list.map(this.mapToEntity);
  }

  async findByIds(ids: number[]): Promise<HobbyEntity[]> {
    const list = await this.prisma.hobby.findMany({
      where: { id: { in: ids } },
    });
    return list.map(this.mapToEntity);
  }

  async findProfileHobbies(profileId: number): Promise<HobbyEntity[]> {
    const list = await this.prisma.profileHobby.findMany({
      where: { profileId },
      include: { hobby: true },
    });
    return list.map((ph) => this.mapToEntity(ph.hobby));
  }

  async updateProfileHobbies(
    profileId: number,
    hobbyIds: number[],
  ): Promise<void> {
    // Delete existing profile hobbies and write new ones in a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.profileHobby.deleteMany({
        where: { profileId },
      });
      await tx.profileHobby.createMany({
        data: hobbyIds.map((hobbyId) => ({
          profileId,
          hobbyId,
        })),
      });
    });
  }

  private mapToEntity(prismaHobby: PrismaHobby): HobbyEntity {
    return new HobbyEntity(
      prismaHobby.id,
      prismaHobby.name,
      prismaHobby.category,
      prismaHobby.createdAt,
      prismaHobby.updatedAt,
    );
  }
}
