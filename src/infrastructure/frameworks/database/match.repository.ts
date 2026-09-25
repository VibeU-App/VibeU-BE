import { Injectable } from '@nestjs/common';
import { IMatchRepository } from '../../../core/abstracts/match-repository.interface';
import { MatchEntity } from '../../../core/entities/match.entity';
import { PrismaService } from './prisma.service';
import { Match as PrismaMatch } from '@prisma/client';

@Injectable()
export class PrismaMatchRepository implements IMatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getCanonicalIdOrder(
    user1Id: string,
    user2Id: string,
  ): [string, string] {
    return user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
  }

  async createMatch(user1Id: string, user2Id: string): Promise<MatchEntity> {
    const canonicalOrderIds = this.getCanonicalIdOrder(user1Id, user2Id);
    const match = await this.prisma.match.create({
      data: {
        user1Id: canonicalOrderIds[0],
        user2Id: canonicalOrderIds[1],
      },
    });

    return match;
  }

  async findById(matchId: string): Promise<MatchEntity | null> {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      return null;
    }

    return match;
  }

  async findMatchBetween(
    userA: string,
    userB: string,
  ): Promise<MatchEntity | null> {
    const canonicalOrderIds = this.getCanonicalIdOrder(userA, userB);
    const match = await this.prisma.match.findFirst({
      where: {
        user1Id: canonicalOrderIds[0],
        user2Id: canonicalOrderIds[1],
      },
    });

    return match;
  }

  async findAllByUserId(userId: string): Promise<MatchEntity[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    return matches;
  }

  async deleteMatch(matchId: string): Promise<boolean> {
    try {
      await this.prisma.match.delete({
        where: {
          id: matchId,
        },
      });
    } catch (error) {
      return false;
    }

    return true;
  }

  private mapToEntity(prismaMatch: PrismaMatch): MatchEntity {
    return new MatchEntity(
      prismaMatch.id,
      prismaMatch.user1Id,
      prismaMatch.user2Id,
      prismaMatch.createdAt,
    );
  }
}
