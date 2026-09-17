import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class PinPostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string, isPinned: boolean): Promise<PostEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('Not authorized');

    return this.postRepository.setPinned(authorId, postId, isPinned);
  }
}
