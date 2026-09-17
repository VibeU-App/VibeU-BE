import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostLikeRepository } from '../../core/abstracts/post-like-repository.abstract';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';

@Injectable()
export class ToggleLikeUsecase {
  constructor(
    @Inject('IPostLikeRepository')
    private readonly postLikeRepository: IPostLikeRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, postId: string): Promise<{ hasLiked: boolean; likeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const result = await this.postLikeRepository.toggleLike(postId, userId);
    return {
      hasLiked: result.hasLiked,
      likeCount: post.likeCount + result.likeDelta,
    };
  }
}
