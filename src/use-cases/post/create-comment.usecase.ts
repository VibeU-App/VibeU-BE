import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../../core/abstracts/comment-repository.abstract';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { CommentEntity } from '../../core/entities/comment.entity';

@Injectable()
export class CreateCommentUsecase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string, content: string): Promise<CommentEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.commentRepository.create({ authorId, postId, content });
    await this.postRepository.incrementCommentCount(postId, 1);
    
    return comment;
  }
}
