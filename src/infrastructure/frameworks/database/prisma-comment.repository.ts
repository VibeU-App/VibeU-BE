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
      const raw = `${last.createdAt.toISOString()}_${last.id}`;
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
