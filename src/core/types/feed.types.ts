import { PostEntity } from '../entities/post.entity';

export interface KeysetCursor {
  tier?: number;
  createdAt: Date;
  id: string;
}

export interface FeedResult<T> {
  items: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface ProfileFeedResult {
  pinnedPost: PostEntity | null;
  items: PostEntity[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}
