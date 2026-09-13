# Research & Decisions: Post & Feed Management (Posting Domain)

## Feature Overview

The Posting Domain enables authenticated users to create text and media posts, manage post lifecycle (pinning, soft-deleting), engage via likes and comments, and consume content through two dedicated feed channels: **Community Timeline Feed** and **User Profile Feed**.

In accordance with system requirements, the entire feature is architecturally aligned with **"PostgreSQL for Everything"**: all feed generation, sorting, filtering, counter maintenance, and cursor pagination are executed natively in PostgreSQL without external caching layers (such as Redis sorted sets / fan-out queues) or third-party search engines.

---

## Technical Decisions & Rationale

### 1. Feed Architecture: Direct PostgreSQL vs. Redis Fan-out ("PostgreSQL for Everything")

* **Decision**: Implement a **Pull-on-Read (Query-Time Aggregation)** model directly querying PostgreSQL for all feeds.
* **Rationale**:
  * **Zero Operational Overhead**: Eliminates running, synchronizing, and monitoring Redis clusters or background message brokers (Kafka/RabbitMQ) for fan-out worker queues.
  * **Strict Data Consistency**: When a post is created, edited, soft-deleted, or pinned, the change is immediately visible in the next feed query with zero cache invalidation lag or stale cache state.
  * **Predictable Low Latency**: With composite B-Tree indexes matching feed query predicates (`WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC`), PostgreSQL retrieves a 20-item feed page in single-digit milliseconds (<15ms index scan).
* **Alternatives Considered**:
  * *Push-model Fan-out with Redis Sorted Sets*: Rejected due to high write amplification on post creation (inserting post IDs into thousands of follower timelines), high memory costs, and cache synchronization complexity.
  * *Elasticsearch / Meilisearch*: Rejected as unnecessary infrastructure complexity for chronological and profile feeds.

---

### 2. Keyset / Cursor-Based Pagination Strategy in PostgreSQL

* **Decision**: Implement **Keyset (Cursor-based) Pagination** using the tuple `(createdAt, id)` encoded as an opaque base64 string.
* **SQL Query Pattern**:
  ```sql
  SELECT * FROM posts
  WHERE deleted_at IS NULL
    AND (
      created_at < :cursorCreatedAt
      OR (created_at = :cursorCreatedAt AND id < :cursorId)
    )
  ORDER BY created_at DESC, id DESC
  LIMIT :limit;
  ```
* **Rationale**:
  * **True $O(1)$ Pagination**: Traditional `OFFSET / LIMIT` pagination requires PostgreSQL to scan and discard thousands of rows when users scroll deeply, causing degraded query performance. Keyset pagination jumps directly to the index position using index seeking.
  * **Elimination of Phantom Duplicates & Gaps**: In high-velocity social apps, users scrolling with `OFFSET` encounter duplicate posts when new posts are published above their view. Keyset pagination remains stable regardless of new concurrent inserts.
  * **Opaque Client Contract**: Clients receive a `nextCursor` string and a `hasMore` boolean in the metadata envelope, decoupling frontend code from database column mechanics.
* **Alternatives Considered**:
  * *Offset/Skip Pagination*: Rejected due to $O(N)$ query degradation and duplicate items during live feed scrolling.

---

### 3. Media Storage Representation for Posts

* **Decision**: Store image URLs directly as a PostgreSQL text array column (`media_urls text[]`), mapped in Prisma as `mediaUrls String[]`.
* **Rationale**:
  * Posts support a maximum of 5 images.
  * Storing URLs directly on the `Post` record avoids relational table JOINs (`JOIN post_images`) when fetching batches of 20+ posts, keeping feed retrieval fast and memory-efficient.
  * Cloud storage binaries are uploaded directly by clients via presigned URLs prior to submission; the backend only validates and stores HTTPS URL strings.
* **Alternatives Considered**:
  * *Separate `PostPhoto` relational table*: Rejected due to extra JOIN overhead on every feed read query for simple static image lists.

---

### 4. Pinned Post Single-Constraint Enforcement

* **Decision**: Enforce at most 1 active pinned post per author profile via an atomic database transaction (`prisma.$transaction`).
* **Mechanism**:
  When an author pins Post B:
  1. Transaction begins.
  2. Any existing post where `authorId = :authorId AND isPinned = true AND id != :postId` has `isPinned` set to `false`.
  3. Target post `id = :postId` has `isPinned` set to `true`.
  4. Transaction commits.
* **Rationale**:
  * Guarantees atomic transition without race conditions if users open multiple tabs or tap rapidly.
  * Simplifies user UX: pinning a new post automatically swaps out the previous pinned post without forcing manual unpinning first.
* **Alternatives Considered**:
  * *PostgreSQL Partial Unique Index (`CREATE UNIQUE INDEX ... WHERE is_pinned = true AND deleted_at IS NULL`)*: While possible, database-level partial unique indexes fail the operation if an author already has a pinned post instead of gracefully unpinning the previous one. Transactional swapping provides a superior user experience.

---

### 5. Soft Deletion & Query Filtering

* **Decision**: Implement soft deletion via `deletedAt DateTime? @map("deleted_at")` on `Post` and `Comment` models.
* **Mechanism**:
  * Deleting a post sets `deletedAt = now()` and sets `isPinned = false`.
  * All public queries filter by `deletedAt: null`.
  * Cascading effect: Comments on a soft-deleted post are inaccessible because the parent post lookup checks `deletedAt: null`.
* **Rationale**:
  * Preserves audit trails, content moderation records, and analytics integrity while immediately removing content from live feeds.
  * Matches the established soft-deletion pattern across VibeU (`User.deletedAt`, `Session.deletedAt`).

---

### 6. Atomic Engagement Counters & Like Interactions

* **Decision**: 
  1. Maintain integer columns `likeCount Int @default(0)` and `commentCount Int @default(0)` on `Post`.
  2. Implement a relational table `PostLike` with compound unique constraint `@@unique([postId, userId])`.
  3. Update counters using PostgreSQL atomic operations (`increment: 1` / `decrement: 1`) inside transactions when a like is created/removed or a comment is posted.
* **Rationale**:
  * Avoids expensive `COUNT(*)` subqueries on feed retrieval (calculating counts for 20 posts on every scroll degrades throughput).
  * Unique constraint on `PostLike` prevents duplicate likes by the same user.
  * Batch querying `PostLike` for the requesting user (`WHERE userId = :currentUserId AND postId IN (:postIds)`) allows returning `hasLiked: boolean` on feed items efficiently in a single query.

---

### 7. PostgreSQL Compound Indexing Strategy

* **Decision**: Define specialized B-Tree compound indexes in `schema.prisma`:
  * **Timeline Feed**: `@@index([deletedAt, createdAt(sort: Desc), id(sort: Desc)])`
    - Powers `WHERE deleted_at IS NULL AND (created_at, id) < (...) ORDER BY created_at DESC, id DESC`.
  * **Profile Feed**: `@@index([authorId, deletedAt, isPinned(sort: Desc), createdAt(sort: Desc)])`
    - Powers `WHERE author_id = :authorId AND deleted_at IS NULL ORDER BY is_pinned DESC, created_at DESC`.
  * **Post Comments**: `@@index([postId, deletedAt, createdAt(sort: Asc)])`
    - Powers chronological comment thread retrieval.
  * **Post Likes**: `@@index([userId, postId])` and `@@unique([postId, userId])`
    - Powers fast like verification and uniqueness.

---

### 8. Three-Tier Relationship-Prioritized Feed in PostgreSQL

* **Decision**: Power the Discovery / Timeline Feed with a **3-tier social affinity hierarchy** evaluated directly in PostgreSQL:
  1. **Tier 1 (Matched Users)**: Authors where a mutual match exists with the viewer (`matches` table).
  2. **Tier 2 (Swiped Users)**: Authors where the viewer swiped right (`swipes.is_like = true`) but a mutual match is not yet formed.
  3. **Tier 3 (Strangers)**: All remaining active authors in the campus network.
* **SQL Query Architecture**:
  The repository fetches the viewer's `matchedUserIds` and `swipedUserIds` in a fast lightweight index lookup, then executes the feed query:
  ```sql
  SELECT p.*,
    CASE
      WHEN p.author_id = ANY($matchedUserIds) THEN 1
      WHEN p.author_id = ANY($swipedUserIds) THEN 2
      ELSE 3
    END AS feed_tier
  FROM posts p
  WHERE p.deleted_at IS NULL
    AND p.author_id != $viewerId
    AND (
      ($cursorTier IS NULL)
      OR (
        (CASE WHEN p.author_id = ANY($matchedUserIds) THEN 1 WHEN p.author_id = ANY($swipedUserIds) THEN 2 ELSE 3 END > $cursorTier)
        OR (
          (CASE WHEN p.author_id = ANY($matchedUserIds) THEN 1 WHEN p.author_id = ANY($swipedUserIds) THEN 2 ELSE 3 END = $cursorTier)
          AND (p.created_at < $cursorCreatedAt OR (p.created_at = $cursorCreatedAt AND p.id < $cursorId))
        )
      )
    )
  ORDER BY
    feed_tier ASC,
    p.created_at DESC,
    p.id DESC
  LIMIT $limit;
  ```
* **Keyset Cursor Encoding**:
  - The opaque cursor encodes `base64(tier + '_' + createdAt.toISOString() + '_' + id)`.
  - When a user finishes reading Tier 1 posts, the keyset query automatically transitions into Tier 2, and subsequently Tier 3, with zero duplicate rows or missing posts across page boundaries.
* **Rationale**:
  - Delivers a personalized, relationship-driven feed experience directly in PostgreSQL without needing a separate recommendation engine, graph database, or Redis fan-out cluster.
  - O(1) page access times are preserved because `matchedUserIds` and `swipedUserIds` arrays for typical users are small (< 500 IDs), allowing PostgreSQL to evaluate the `CASE` statement rapidly against indexed post scans.
