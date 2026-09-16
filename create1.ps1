$content = @'
export type AuthorRelation = 'MATCHED' | 'SWIPED' | 'STRANGER';

export class PostEntity {
  id: string;
  authorId: string;
  content: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  hasLiked?: boolean;
  relation?: AuthorRelation;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
'@
Set-Content -Path "src/core/entities/post.entity.ts" -Value $content -Encoding UTF8

$content = @'
export class CommentEntity {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
'@
Set-Content -Path "src/core/entities/comment.entity.ts" -Value $content -Encoding UTF8

$content = @'
export class PostLikeEntity {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}
'@
Set-Content -Path "src/core/entities/post-like.entity.ts" -Value $content -Encoding UTF8

New-Item -ItemType Directory -Force -Path "src/core/types" | Out-Null
$content = @'
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
'@
Set-Content -Path "src/core/types/feed.types.ts" -Value $content -Encoding UTF8

$content = @'
import { PostEntity } from '../entities/post.entity';
import { FeedResult, KeysetCursor, ProfileFeedResult } from '../types/feed.types';

export abstract class IPostRepository {
  abstract create(data: {
    authorId: string;
    content?: string | null;
    mediaUrls?: string[];
  }): Promise<PostEntity>;

  abstract findById(id: string, currentUserId?: string): Promise<PostEntity | null>;

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
'@
Set-Content -Path "src/core/abstracts/post-repository.abstract.ts" -Value $content -Encoding UTF8

$content = @'
import { CommentEntity } from '../entities/comment.entity';

export abstract class ICommentRepository {
  abstract create(data: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<CommentEntity>;

  abstract findByPostId(
    postId: string,
    options?: { limit?: number; cursor?: { createdAt: Date; id: string } },
  ): Promise<{ items: CommentEntity[]; nextCursor: string | null; hasMore: boolean }>;

  abstract findById(id: string): Promise<CommentEntity | null>;
}
'@
Set-Content -Path "src/core/abstracts/comment-repository.abstract.ts" -Value $content -Encoding UTF8

$content = @'
export abstract class IPostLikeRepository {
  abstract toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likeDelta: number }>;

  abstract hasUserLiked(postId: string, userId: string): Promise<boolean>;

  abstract getUserLikedPostIds(
    postIds: string[],
    userId: string,
  ): Promise<Set<string>>;
}
'@
Set-Content -Path "src/core/abstracts/post-like-repository.abstract.ts" -Value $content -Encoding UTF8

$content = @'
export abstract class ISocialRelationRepository {
  abstract getMatchedUserIds(userId: string): Promise<string[]>;
  abstract getSwipedRightUserIds(userId: string): Promise<string[]>;
}
'@
Set-Content -Path "src/core/abstracts/social-relation-repository.abstract.ts" -Value $content -Encoding UTF8

Write-Host "Created entities and abstract repositories"
