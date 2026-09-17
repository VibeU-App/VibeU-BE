import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '../../core/abstracts/comment-repository.abstract';
import { CommentEntity } from '../../core/entities/comment.entity';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetCommentsUsecase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(postId: string, limit: number = 20, cursor?: string): Promise<{ items: CommentEntity[]; nextCursor: string | null; hasMore: boolean }> {
    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;
    return this.commentRepository.findByPostId(postId, {
      limit,
      cursor: decodedCursor ? { createdAt: decodedCursor.createdAt, id: decodedCursor.id } : undefined,
    });
  }
}
