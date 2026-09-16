import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';

@Injectable()
export class DeletePostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('Not authorized');

    await this.postRepository.softDelete(postId);
  }
}
