import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class CreatePostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, content?: string, mediaUrls?: string[]): Promise<PostEntity> {
    if ((!content || content.trim().length === 0) && (!mediaUrls || mediaUrls.length === 0)) {
      throw new BadRequestException('Post must contain text or at least one image attachment');
    }
    return this.postRepository.create({ authorId, content, mediaUrls });
  }
}
