import { Injectable } from '@nestjs/common';
import { ISocialRelationRepository } from '../../../core/abstracts/social-relation-repository.abstract';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSocialRelationRepository implements ISocialRelationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMatchedUserIds(userId: string): Promise<string[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { user1Id: true, user2Id: true },
    });
    return matches.map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id));
  }

  async getSwipedRightUserIds(userId: string): Promise<string[]> {
    const swipes = await this.prisma.swipe.findMany({
      where: { swiperId: userId, isLike: true },
      select: { targetId: true },
    });
    return swipes.map((s) => s.targetId);
  }
}
