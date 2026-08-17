# Research & Decisions: Post & Comment Management (Posting Domain)

## Feature Overview

The Posting Domain enables authenticated users to create text/image posts, pin/unpin a post on their profile, soft-delete posts, view profile feeds with engagement counts, and comment on posts.

---

## Technical Decisions & Rationale

### 1. Media Storage Representation for Posts

* **Decision**: Use a PostgreSQL string array `mediaUrls String[]` directly on the `Post` model in Prisma.
* **Rationale**:
  * Up to 5 image attachments per post.
  * Direct array storage in PostgreSQL eliminates table join overhead during feed retrieval, achieving optimal performance (<100ms response times).
  * Simplifies DTO mapping in Clean Architecture entity mappers.
* **Alternatives Considered**:
  * *Separate `PostPhoto` relational table*: Rejected due to unnecessary JOIN overhead for simple ordered image URL lists.

---

### 2. Pinned Post Single-Constraint Enforcement

* **Decision**: Combine application-level transactional updates (`prisma.$transaction`) with database soft-delete filtering. When a user pins a post, any existing pinned post for that `authorId` has its `isPinned` flag updated to `false` within the same database transaction.
* **Rationale**:
  * Guarantees at most 1 active pinned post per user profile without race conditions.
  * Allows seamless switching of pinned posts without requiring manual unpinning first.
* **Alternatives Considered**:
  * *Client-enforced unpinning*: Rejected because it creates race conditions and allows inconsistent database states if the unpin request fails.

---

### 3. Soft Deletion & Cascading Behavior

* **Decision**: Add `deletedAt DateTime? @map("deleted_at")` to `Post` and `Comment` Prisma models. When a post is deleted:
  1. `deletedAt` is populated with the current timestamp.
  2. `isPinned` is automatically set to `false`.
  3. Associated comments are soft-deleted or excluded via `deletedAt: null` filter queries.
* **Rationale**:
  * Aligns with existing soft-deletion patterns in `User` and `Session` models across the VibeU backend codebase.
  * Ensures deleted posts are instantly filtered out from feed and comment queries.
* **Alternatives Considered**:
  * *Hard deletion (`DELETE FROM posts`)*: Rejected to preserve audit records and prevent data loss.

---

### 4. Aggregate Metric Counter Strategy

* **Decision**: Maintain integer columns `commentCount Int @default(0)` and `likeCount Int @default(0)` on the `Post` record, updating them atomically using Prisma's `increment` and `decrement` operators.
* **Rationale**:
  * Reading feed lists with 20+ posts requires fast, O(1) attribute access per post rather than executing `COUNT(*)` aggregate subqueries.
  * Atomic `increment` operations ensure concurrent comments don't create race conditions in comment counts.
* **Alternatives Considered**:
  * *On-the-fly `COUNT(*)` queries*: Rejected due to exponential performance degradation as comment volume grows.

---

### 5. Feed Query Sorting & Indexing

* **Decision**: Add compound database indexes on `Post`:
  * `@@index([authorId, deletedAt, isPinned, createdAt(sort: Desc)])`
  * `@@index([deletedAt, createdAt(sort: Desc)])`
* **Rationale**:
  * Optimizes fetching a profile feed (where `authorId = X AND deletedAt IS NULL`), returning pinned posts first followed by chronologically sorted posts.
  * Supports general timeline feed queries efficiently.
