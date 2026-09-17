import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class GetPostDetailUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postId: string, currentUserId: string): Promise<PostEntity> {
    const post = await this.postRepository.findById(postId, currentUserId);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
