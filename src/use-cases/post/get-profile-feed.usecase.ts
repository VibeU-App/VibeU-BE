import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { ProfileFeedResult } from '../../core/types/feed.types';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetProfileFeedUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, currentUserId: string, limit: number = 20, cursor?: string): Promise<ProfileFeedResult> {
    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;
    return this.postRepository.findProfileFeed(authorId, {
      limit,
      cursor: decodedCursor ?? undefined,
      currentUserId,
    });
  }
}
