import { PostEntity } from '../entities/post.entity';
import {
  FeedResult,
  KeysetCursor,
  ProfileFeedResult,
} from '../types/feed.types';

export abstract class IPostRepository {
  abstract create(data: {
    authorId: string;
    content?: string | null;
    mediaUrls?: string[];
  }): Promise<PostEntity>;

  abstract findById(
    id: string,
    currentUserId?: string,
  ): Promise<PostEntity | null>;

  abstract findTimelineFeed(options: {
    viewerId: string;
    matchedUserIds: string[];
    swipedUserIds: string[];
    limit: number;
    cursor?: KeysetCursor;
  }): Promise<FeedResult<PostEntity>>;

  abstract findProfileFeed(
    authorId: string,
    options: {
      limit: number;
      cursor?: KeysetCursor;
      currentUserId?: string;
    },
  ): Promise<ProfileFeedResult>;

  abstract setPinned(
    authorId: string,
    postId: string,
    isPinned: boolean,
  ): Promise<PostEntity>;

  abstract softDelete(id: string): Promise<void>;

  abstract incrementCommentCount(postId: string, by: number): Promise<void>;

  abstract incrementLikeCount(postId: string, by: number): Promise<void>;
}
