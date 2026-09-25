# Data Model: Post & Feed Management (Posting Domain)

## Prisma Database Schema Additions

```prisma
// Post model - stores user posts with text and image media
model Post {
  id           String    @id @default(uuid())
  authorId     String    @map("author_id")
  content      String?   @db.Text
  mediaUrls    String[]  @default([]) @map("media_urls")
  isPinned     Boolean   @default(false) @map("is_pinned")
  likeCount    Int       @default(0) @map("like_count")
  commentCount Int       @default(0) @map("comment_count")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  // Relations
  user     User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]
  likes    PostLike[]

  // Indexes optimized for PostgreSQL Keyset Feeds
  @@index([deletedAt, createdAt(sort: Desc), id(sort: Desc)])
  @@index([authorId, deletedAt, isPinned(sort: Desc), createdAt(sort: Desc)])
  @@map("posts")
}

// Comment model - stores user comments on posts
model Comment {
  id        String    @id @default(uuid())
  postId    String    @map("post_id")
  authorId  String    @map("author_id")
  content   String    @db.VarChar(500)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([postId, deletedAt, createdAt(sort: Asc)])
  @@index([authorId, deletedAt])
  @@map("comments")
}

// PostLike model - tracks post likes with strict 1-like-per-user constraint
model PostLike {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Uniqueness & Fast Lookup Indexes
  @@unique([postId, userId])
  @@index([userId, postId])
  @@map("post_likes")
}

// Swipe model - records swiping activity between users for feed tiering & matching
model Swipe {
  id        String   @id @default(uuid())
  swiperId  String   @map("swiper_id")
  targetId  String   @map("target_id")
  isLike    Boolean  @default(true) @map("is_like")
  createdAt DateTime @default(now()) @map("created_at")

  swiper User @relation("SwiperUser", fields: [swiperId], references: [id], onDelete: Cascade)
  target User @relation("TargetUser", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([swiperId, targetId])
  @@index([swiperId, isLike])
  @@index([targetId, isLike])
  @@map("swipes")
}

// Match model - records mutual right-swipe connections
model Match {
  id        String   @id @default(uuid())
  user1Id   String   @map("user1_id")
  user2Id   String   @map("user2_id")
  createdAt DateTime @default(now()) @map("created_at")

  user1 User @relation("MatchUser1", fields: [user1Id], references: [id], onDelete: Cascade)
  user2 User @relation("MatchUser2", fields: [user2Id], references: [id], onDelete: Cascade)

  @@unique([user1Id, user2Id])
  @@index([user1Id])
  @@index([user2Id])
  @@map("matches")
}
```

---

## Domain Entities (Clean Architecture Core)

### `PostEntity` (`src/core/entities/post.entity.ts`)

```typescript
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

  // Joined/Populated Author info (for response rendering)
  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
```

### `CommentEntity` (`src/core/entities/comment.entity.ts`)

```typescript
export class CommentEntity {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Joined/Populated Author info
  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
```

### `PostLikeEntity` (`src/core/entities/post-like.entity.ts`)

```typescript
export class PostLikeEntity {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}
```

---

## Keyset Cursor Pagination Contract

```typescript
export interface KeysetCursor {
  tier?: number; // 1: MATCHED, 2: SWIPED, 3: STRANGER
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
```

---

## Abstract Repository Contracts

### `IPostRepository` (`src/core/abstracts/post-repository.abstract.ts`)

```typescript
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
```

### `ICommentRepository` (`src/core/abstracts/comment-repository.abstract.ts`)

```typescript
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
```

### `IPostLikeRepository` (`src/core/abstracts/post-like-repository.abstract.ts`)

```typescript
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
```

### `ISocialRelationRepository` (`src/core/abstracts/social-relation-repository.abstract.ts`)

```typescript
export abstract class ISocialRelationRepository {
  abstract getMatchedUserIds(userId: string): Promise<string[]>;
  abstract getSwipedRightUserIds(userId: string): Promise<string[]>;
}
```

---

## Validation & Business Rules

1. **Post Content Validation**:
   - `content` length: 0 to 2000 characters.
   - `mediaUrls` array length: 0 to 5 strings.
   - Validation Rule: Either `content` MUST be non-empty OR `mediaUrls` MUST contain at least 1 URL. If both are empty, throws `BadRequestException("Post must contain text or at least one image attachment")`.

2. **Pinning Rule**:
   - Only the post's author (`authorId`) can pin/unpin a post. Attempt by non-author throws `ForbiddenException`.
   - When `isPinned` is set to `true`, any existing post with `authorId = X AND isPinned = true` is transactionally reset to `isPinned = false` within `prisma.$transaction`.

3. **Deletion Rule**:
   - Only the post's author can delete their post. Attempt by non-author throws `ForbiddenException`.
   - Post soft-deletion sets `deletedAt = now()` and sets `isPinned = false`.

4. **Like Uniqueness & Atomic Counter**:
   - Exactly one like per `(postId, userId)` enforced by compound primary/unique constraint.
   - Toggling like updates `PostLike` table and atomically modifies `post.likeCount` in a single transaction.

5. **3-Tier Feed Prioritization & Keyset Cursor**:
   - Timeline queries evaluate relation affinity: Tier 1 (`MATCHED`), Tier 2 (`SWIPED`), Tier 3 (`STRANGER`).
   - Cursors are serialized as `base64(tier + '_' + createdAt.toISOString() + '_' + id)`.
   - Guarantees seamless progression across tiers as users scroll, with zero duplicate rows and zero skipped items.
