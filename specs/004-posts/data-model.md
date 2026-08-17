# Data Model: Post & Comment Management (Posting Domain)

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
  user     User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]

  // Indexes
  @@index([authorId, deletedAt, isPinned, createdAt(sort: Desc)])
  @@index([deletedAt, createdAt(sort: Desc)])
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
```

---

## Domain Entities (Clean Architecture Core)

### `PostEntity` (`src/core/entities/post.entity.ts`)

```typescript
export class PostEntity {
  id: string;
  authorId: string;
  content: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
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

---

## Abstract Repository Contracts

### `IPostRepository` (`src/core/abstracts/post-repository.abstract.ts`)

```typescript
export abstract class IPostRepository {
  abstract create(data: {
    authorId: string;
    content?: string | null;
    mediaUrls?: string[];
  }): Promise<PostEntity>;

  abstract findById(id: string): Promise<PostEntity | null>;

  abstract findFeedByAuthor(
    authorId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<PostEntity[]>;

  abstract setPinned(
    authorId: string,
    postId: string,
    isPinned: boolean,
  ): Promise<PostEntity>;

  abstract softDelete(id: string): Promise<void>;

  abstract incrementCommentCount(postId: string, by: number): Promise<void>;
}
```

### `ICommentRepository` (`src/core/abstracts/comment-repository.abstract.ts`)

```typescript
export abstract class ICommentRepository {
  abstract create(data: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<CommentEntity>;

  abstract findByPostId(
    postId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<CommentEntity[]>;

  abstract findById(id: string): Promise<CommentEntity | null>;
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
   - When `isPinned` is set to `true`, any existing post with `authorId = X AND isPinned = true` is transactionally reset to `isPinned = false`.

3. **Deletion Rule**:
   - Only the post's author can delete their post. Attempt by non-author throws `ForbiddenException`.
   - Post soft-deletion automatically decrements/resets pinned status and excludes associated comments from query listings.

4. **Comment Content Validation**:
   - `content` MUST be non-empty string, length 1 to 500 characters.
