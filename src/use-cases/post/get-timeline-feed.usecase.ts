import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { ISocialRelationRepository } from '../../core/abstracts/social-relation-repository.abstract';
import { FeedResult } from '../../core/types/feed.types';
import { PostEntity } from '../../core/entities/post.entity';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetTimelineFeedUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    @Inject('ISocialRelationRepository')
    private readonly socialRepo: ISocialRelationRepository,
  ) {}

  async execute(viewerId: string, limit: number = 20, cursor?: string): Promise<FeedResult<PostEntity>> {
    const [matchedUserIds, swipedUserIds] = await Promise.all([
      this.socialRepo.getMatchedUserIds(viewerId),
      this.socialRepo.getSwipedRightUserIds(viewerId),
    ]);

    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;

    return this.postRepository.findTimelineFeed({
      viewerId,
      matchedUserIds,
      swipedUserIds,
      limit,
      cursor: decodedCursor ?? undefined,
    });
  }
}
