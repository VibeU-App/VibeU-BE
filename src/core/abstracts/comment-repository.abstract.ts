import { CommentEntity } from '../entities/comment.entity';

export abstract class ICommentRepository {
  abstract create(data: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<CommentEntity>;

  abstract findByPostId(
    postId: string,
    options?: { limit?: number; cursor?: { createdAt: Date; id: string } },
  ): Promise<{
    items: CommentEntity[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;

  abstract findById(id: string): Promise<CommentEntity | null>;
}
