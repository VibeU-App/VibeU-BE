$content = @'
import { Injectable } from '@nestjs/common';
import { IPostRepository } from '../../../core/abstracts/post-repository.abstract';
import { PostEntity, AuthorRelation } from '../../../core/entities/post.entity';
import { FeedResult, KeysetCursor, ProfileFeedResult } from '../../../core/types/feed.types';
import { PrismaService } from './prisma.service';
import { Post as PrismaPost, Prisma } from '@prisma/client';

type PostWithAuthor = PrismaPost & {
  user: {
    id: string;
    profile: { nickname: string; avatarSeed: string } | null;
  };
};

@Injectable()
export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    authorId: string;
    content?: string | null;
    mediaUrls?: string[];
  }): Promise<PostEntity> {
    const post = await this.prisma.post.create({
      data: {
        authorId: data.authorId,
        content: data.content ?? null,
        mediaUrls: data.mediaUrls ?? [],
      },
      include: {
        user: { include: { profile: true } },
      },
    });
    return this.mapToEntity(post as unknown as PostWithAuthor);
  }

  async findById(id: string, currentUserId?: string): Promise<PostEntity | null> {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: { user: { include: { profile: true } } },
    });
    if (!post) return null;
    const entity = this.mapToEntity(post as unknown as PostWithAuthor);
    if (currentUserId) {
      const like = await this.prisma.postLike.findUnique({
        where: { postId_userId: { postId: id, userId: currentUserId } },
      });
      entity.hasLiked = !!like;
    }
    return entity;
  }

  async findTimelineFeed(options: {
    viewerId: string;
    matchedUserIds: string[];
    swipedUserIds: string[];
    limit: number;
    cursor?: KeysetCursor;
  }): Promise<FeedResult<PostEntity>> {
    const { viewerId, matchedUserIds, swipedUserIds, limit, cursor } = options;
    const fetchLimit = limit + 1;
    const startTier = cursor?.tier ?? 1;
    const allPosts: Array<PostEntity & { _tier: number }> = [];

    const tierGroups: Array<{ tier: number; authorIds: string[] | null }> = [
      { tier: 1, authorIds: matchedUserIds.length > 0 ? matchedUserIds : [] },
      {
        tier: 2,
        authorIds: swipedUserIds.filter((id) => !matchedUserIds.includes(id)),
      },
      { tier: 3, authorIds: null },
    ];

    const excludedIds = [...matchedUserIds, ...swipedUserIds, viewerId];

    for (const group of tierGroups) {
      if (allPosts.length >= fetchLimit) break;
      if (group.tier < startTier) continue;

      const remaining = fetchLimit - allPosts.length;
      let where: Prisma.PostWhereInput = { deletedAt: null };

      if (group.tier === 3) {
        where = { ...where, authorId: { notIn: excludedIds } };
      } else if (group.authorIds !== null && group.authorIds.length === 0) {
        continue;
      } else if (group.authorIds !== null) {
        where = { ...where, authorId: { in: group.authorIds } };
      }

      if (cursor && cursor.tier === group.tier) {
        where = {
          ...where,
          OR: [
            { createdAt: { lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, id: { lt: cursor.id } },
          ],
        };
      }

      const posts = await this.prisma.post.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: remaining,
        include: { user: { include: { profile: true } } },
      });

      const relation: AuthorRelation =
        group.tier === 1 ? 'MATCHED' : group.tier === 2 ? 'SWIPED' : 'STRANGER';

      for (const p of posts) {
        const entity = this.mapToEntity(p as unknown as PostWithAuthor);
        entity.relation = relation;
        allPosts.push({ ...entity, _tier: group.tier });
      }
    }

    const hasMore = allPosts.length > limit;
    const items = allPosts.slice(0, limit);

    const postIds = items.map((p) => p.id);
    const likedSet = await this.getLikedPostIds(postIds, viewerId);
    items.forEach((p) => { p.hasLiked = likedSet.has(p.id); });

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1] as any;
      const raw = ${last._tier}__;
      nextCursor = Buffer.from(raw).toString('base64');
    }

    return { items, pagination: { limit, nextCursor, hasMore } };
  }

  async findProfileFeed(
    authorId: string,
    options: { limit: number; cursor?: KeysetCursor; currentUserId?: string },
  ): Promise<ProfileFeedResult> {
    const { limit, cursor, currentUserId } = options;

    const pinnedRaw = await this.prisma.post.findFirst({
      where: { authorId, isPinned: true, deletedAt: null },
      include: { user: { include: { profile: true } } },
    });

    let pinnedPost: PostEntity | null = null;
    if (pinnedRaw) {
      pinnedPost = this.mapToEntity(pinnedRaw as unknown as PostWithAuthor);
      if (currentUserId) {
        const like = await this.prisma.postLike.findUnique({
          where: { postId_userId: { postId: pinnedRaw.id, userId: currentUserId } },
        });
        pinnedPost.hasLiked = !!like;
      }
    }

    let where: Prisma.PostWhereInput = {
      authorId,
      deletedAt: null,
      isPinned: false,
    };

    if (cursor) {
      where = {
        ...where,
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      };
    }

    const fetchLimit = limit + 1;
    const rawPosts = await this.prisma.post.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: fetchLimit,
      include: { user: { include: { profile: true } } },
    });

    const hasMore = rawPosts.length > limit;
    const pagePosts = rawPosts.slice(0, limit);
    const items = pagePosts.map((p) => this.mapToEntity(p as unknown as PostWithAuthor));

    if (currentUserId && items.length > 0) {
      const postIds = items.map((p) => p.id);
      const likedSet = await this.getLikedPostIds(postIds, currentUserId);
      items.forEach((p) => { p.hasLiked = likedSet.has(p.id); });
    }

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      const raw = ${last.createdAt.toISOString()}_;
      nextCursor = Buffer.from(raw).toString('base64');
    }

    return { pinnedPost, items, pagination: { limit, nextCursor, hasMore } };
  }

  async setPinned(authorId: string, postId: string, isPinned: boolean): Promise<PostEntity> {
    const result = await this.prisma.(async (tx) => {
      if (isPinned) {
        await tx.post.updateMany({
          where: { authorId, isPinned: true, id: { not: postId }, deletedAt: null },
          data: { isPinned: false },
        });
      }
      return tx.post.update({
        where: { id: postId },
        data: { isPinned },
        include: { user: { include: { profile: true } } },
      });
    });
    return this.mapToEntity(result as unknown as PostWithAuthor);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date(), isPinned: false },
    });
  }

  async incrementCommentCount(postId: string, by: number): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: by } },
    });
  }

  async incrementLikeCount(postId: string, by: number): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: by } },
    });
  }

  private async getLikedPostIds(postIds: string[], userId: string): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId },
      select: { postId: true },
    });
    return new Set(likes.map((l) => l.postId));
  }

  private mapToEntity(post: PostWithAuthor): PostEntity {
    const entity = new PostEntity();
    entity.id = post.id;
    entity.authorId = post.authorId;
    entity.content = post.content;
    entity.mediaUrls = post.mediaUrls;
    entity.isPinned = post.isPinned;
    entity.likeCount = post.likeCount;
    entity.commentCount = post.commentCount;
    entity.createdAt = post.createdAt;
    entity.updatedAt = post.updatedAt;
    entity.deletedAt = post.deletedAt;
    if (post.user?.profile) {
      entity.author = {
        userId: post.user.id,
        fullName: post.user.profile.nickname,
        avatarSeed: post.user.profile.avatarSeed,
      };
    }
    return entity;
  }
}
'@
Set-Content -Path "src/infrastructure/frameworks/database/prisma-post.repository.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../../core/abstracts/comment-repository.abstract';
import { CommentEntity } from '../../../core/entities/comment.entity';
import { PrismaService } from './prisma.service';
import { Comment as PrismaComment } from '@prisma/client';

type CommentWithAuthor = PrismaComment & {
  user: {
    id: string;
    profile: { nickname: string; avatarSeed: string } | null;
  };
};

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<CommentEntity> {
    const comment = await this.prisma.comment.create({
      data,
      include: { user: { include: { profile: true } } },
    });
    return this.mapToEntity(comment as unknown as CommentWithAuthor);
  }

  async findByPostId(
    postId: string,
    options?: { limit?: number; cursor?: { createdAt: Date; id: string } },
  ): Promise<{ items: CommentEntity[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = options?.limit ?? 20;
    const fetchLimit = limit + 1;

    const where = {
      postId,
      deletedAt: null,
      ...(options?.cursor
        ? {
            OR: [
              { createdAt: { gt: options.cursor.createdAt } },
              { createdAt: options.cursor.createdAt, id: { gt: options.cursor.id } },
            ],
          }
        : {}),
    };

    const comments = await this.prisma.comment.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: fetchLimit,
      include: { user: { include: { profile: true } } },
    });

    const hasMore = comments.length > limit;
    const page = comments.slice(0, limit);
    const items = page.map((c) => this.mapToEntity(c as unknown as CommentWithAuthor));

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      const raw = ${last.createdAt.toISOString()}_;
      nextCursor = Buffer.from(raw).toString('base64');
    }

    return { items, nextCursor, hasMore };
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
      include: { user: { include: { profile: true } } },
    });
    return comment ? this.mapToEntity(comment as unknown as CommentWithAuthor) : null;
  }

  private mapToEntity(comment: CommentWithAuthor): CommentEntity {
    const entity = new CommentEntity();
    entity.id = comment.id;
    entity.postId = comment.postId;
    entity.authorId = comment.authorId;
    entity.content = comment.content;
    entity.createdAt = comment.createdAt;
    entity.updatedAt = comment.updatedAt;
    entity.deletedAt = comment.deletedAt;
    if (comment.user?.profile) {
      entity.author = {
        userId: comment.user.id,
        fullName: comment.user.profile.nickname,
        avatarSeed: comment.user.profile.avatarSeed,
      };
    }
    return entity;
  }
}
'@
Set-Content -Path "src/infrastructure/frameworks/database/prisma-comment.repository.ts" -Value $content -Encoding UTF8

$content = @'
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
    return this.prisma.(async (tx) => {
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
'@
Set-Content -Path "src/infrastructure/frameworks/database/prisma-post-like.repository.ts" -Value $content -Encoding UTF8

$content = @'
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
'@
Set-Content -Path "src/infrastructure/frameworks/database/prisma-social-relation.repository.ts" -Value $content -Encoding UTF8

Write-Host "Created concrete repositories"
