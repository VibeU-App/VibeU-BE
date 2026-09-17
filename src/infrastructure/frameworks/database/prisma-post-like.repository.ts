import { Injectable } from '@nestjs/common';
import { IPostLikeRepository } from '../../../core/abstracts/post-like-repository.abstract';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaPostLikeRepository implements IPostLikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likeDelta: number }> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await tx.postLike.delete({
          where: { postId_userId: { postId, userId } },
        });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
        return { hasLiked: false, likeDelta: -1 };
      } else {
        await tx.postLike.create({ data: { postId, userId } });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
        return { hasLiked: true, likeDelta: 1 };
      }
    });
  }

  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return !!like;
  }

  async getUserLikedPostIds(postIds: string[], userId: string): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId },
      select: { postId: true },
    });
    return new Set(likes.map((l) => l.postId));
  }
}
