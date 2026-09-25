# Feature Specification: Post & Feed Management (Posting Domain)

**Feature Branch**: `004-posts`

**Created**: 2026-08-17 (Updated: 2026-09-13)

**Status**: Draft

**Input**: User description: "I intend to create the posting feature. There will have 2 flows: posting and feeds. I need a spec that is aligned with the option postgresql for everything"

---

## User Scenarios & Testing *(mandatory)*

### Flow 1: Posting Flow

#### User Story 1 - Post Creation with Text & Media (Priority: P1)

Authenticated users must be able to publish new posts containing text content, up to 5 image attachments, or both.

**Why this priority**: Essential foundation of user-generated content and community expression on the platform.

**Independent Test**: Can be fully tested by submitting posts with text only, images only, and text + images combined, and verifying that the created post appears with all content and author metadata.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the post composition screen, **When** they submit a post containing text (1 to 2000 characters) and/or 1 to 5 attached image URLs, **Then** the system creates the post in active status, records the current timestamp, and returns the newly created post with initial engagement counts (`likeCount: 0`, `commentCount: 0`).
2. **Given** an authenticated user attempting to publish a post, **When** they submit an empty post with no text body and no attached images, **Then** the system rejects the submission with a descriptive validation error.
3. **Given** an authenticated user attaching images, **When** they attempt to submit more than 5 image URLs in a single post, **Then** the system rejects the submission with a validation error indicating the 5-image limit.

---

#### User Story 2 - Profile Post Pinning & Unpinning (Priority: P1)

Authors must be able to pin a single post to highlight it at the top of their profile feed, or unpin a previously pinned post.

**Why this priority**: Core profile customization capability allowing users to feature their primary showcase content.

**Independent Test**: Can be fully tested by pinning a post, verifying it appears first in the profile feed, pinning a different post to verify the previous one is unpinned automatically, and unpinning to confirm return to chronological order.

**Acceptance Scenarios**:

1. **Given** a post author viewing their own active post, **When** they choose to pin the post, **Then** the system marks the post as pinned and places it at the top position on their profile feed.
2. **Given** a user who already has a pinned post on their profile, **When** they pin a different post, **Then** the system unpins the previously pinned post atomically so that exactly one post remains pinned per profile.
3. **Given** a post author with an active pinned post, **When** they choose to unpin that post, **Then** the post returns to its normal chronological position among their posts.
4. **Given** an authenticated user viewing a post created by another user, **When** they attempt to pin that post, **Then** the system denies the action with an authorization error.

---

#### User Story 3 - Post Soft Deletion (Priority: P1)

Post authors must be able to delete their own posts, ensuring deleted content is immediately removed from public feeds while preserving audit records.

**Why this priority**: Critical user privacy and content moderation requirement.

**Independent Test**: Can be fully tested by an author deleting a post and verifying it immediately ceases to appear in timeline feeds, profile feeds, and direct detail queries.

**Acceptance Scenarios**:

1. **Given** an author viewing their own active post, **When** they confirm deletion of the post, **Then** the system marks the post as soft-deleted, automatically clears its pinned status, and excludes it from all active feed queries and comment listings.
2. **Given** an authenticated user attempting to delete a post created by someone else, **When** they submit a deletion request, **Then** the system denies the request with an authorization error.
3. **Given** a post that has been soft-deleted, **When** any user attempts to fetch the post by ID, **Then** the system returns a not found response.

---

#### User Story 4 - Post Engagement & Comments (Priority: P2)

Authenticated users must be able to interact with active posts by liking/unliking and submitting comments.

**Why this priority**: Drives community engagement, conversation, and social feedback loops.

**Independent Test**: Can be fully tested by adding a comment to a post and toggling a like, confirming that engagement counts increment/decrement accurately.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an active post, **When** they submit a comment containing 1 to 500 characters, **Then** the system saves the comment with author metadata and atomically increments the post's comment count by 1.
2. **Given** an authenticated user viewing an active post, **When** they toggle the "like" action, **Then** the system records the user's like and atomically increments the post's like count by 1.
3. **Given** an authenticated user who has already liked a post, **When** they toggle the "like" action again, **Then** the system removes the like and atomically decrements the post's like count by 1.
4. **Given** an authenticated user attempting to comment on a soft-deleted post, **When** they submit the comment, **Then** the system rejects the operation with a not found error.

---

### Flow 2: Feeds Flow

#### User Story 5 - Discovery / Timeline Feed with 3-Tier Relationship Prioritization & Keyset Pagination (Priority: P1)

Authenticated users must be able to retrieve a continuous timeline/discovery feed of active posts, prioritized by a **3-tier social relationship hierarchy** powered natively by PostgreSQL:
1. **Tier 1 (Matched Users)**: Posts authored by users where both the viewer and the author have mutually swiped right (matched).
2. **Tier 2 (Swiped-Right Users)**: Posts authored by users whom the current viewer has swiped right on (pending / one-way interest).
3. **Tier 3 (Strangers)**: Posts from all other users across the campus network that the viewer has neither matched with nor swiped right on.

Within each tier, posts are ordered in descending chronological order (`createdAt DESC, id DESC`).

**Why this priority**: Primary social engagement driver that connects user dating/matching actions with community content, ensuring users see posts from their romantic connections and crushes first before general campus content.

**Independent Test**: Can be fully tested by setting up test users in matched, swiped-right, and stranger states, querying the timeline feed, and verifying posts arrive in strict Tier 1 -> Tier 2 -> Tier 3 sequence, with pagination smoothly traversing across tier boundaries.

**Acceptance Scenarios**:

1. **Given** an authenticated user who has matched connections, **When** they load the timeline feed, **Then** posts from matched users (Tier 1) are returned first, sorted newest to oldest, with author snapshot and relationship indicator (`relation: "MATCHED"`).
2. **Given** a user who has viewed all posts from their matches, **When** they scroll further, **Then** the feed seamlessly delivers posts from users they swiped right on (Tier 2) in chronological order with indicator (`relation: "SWIPED"`).
3. **Given** a user who has scrolled past all matched and swiped posts, **When** they continue scrolling, **Then** the feed seamlessly serves posts from other campus users / strangers (Tier 3) in chronological order with indicator (`relation: "STRANGER"`).
4. **Given** a new user who has zero swipes and zero matches, **When** they load the timeline feed, **Then** the system returns active community posts from strangers (Tier 3) in pure chronological order.
5. **Given** a user paginating with `nextCursor`, **When** the cursor crosses a tier boundary (e.g., from Tier 1 to Tier 2), **Then** the subsequent query resumes at the exact next tier and timestamp with zero missing posts and zero duplicate items.
6. **Given** timeline queries encountering soft-deleted posts, **When** assembling any tier, **Then** soft-deleted posts are completely omitted.

---

#### User Story 6 - Profile Feed (Priority: P2)

Users must be able to view all posts authored by a specific user profile, with any pinned post appearing prominently at the top followed by the remaining posts in descending chronological order.

**Why this priority**: Essential for reviewing a user's portfolio of posts and learning about an individual member.

**Independent Test**: Can be fully tested by loading a profile feed for an author with a pinned post and multiple unpinned posts, verifying that the pinned post is returned first, followed by unpinned posts in chronological order.

**Acceptance Scenarios**:

1. **Given** a user viewing an author's profile feed, **When** the author has an active pinned post, **Then** the feed returns the pinned post at index 0, followed by the author's unpinned active posts ordered newest to oldest.
2. **Given** an author with no pinned post, **When** their profile feed is fetched, **Then** all active posts are returned in pure descending chronological order.
3. **Given** a profile feed with more posts than the requested page limit, **When** requesting subsequent pages via cursor pagination, **Then** the system returns older unpinned posts without re-emitting the pinned post.

---

#### User Story 7 - Post Detail & Comment Feed (Priority: P3)

Users must be able to fetch a single post by ID along with its chronological list of comments.

**Why this priority**: Provides the focused conversation view where users read and participate in discussions.

**Independent Test**: Can be fully tested by requesting a post by ID and retrieving its comments ordered chronologically from oldest to newest.

**Acceptance Scenarios**:

1. **Given** an authenticated user navigating to a post detail, **When** they fetch the post by its ID, **Then** the system returns the complete post data, author profile details, engagement counts, and like state for the requesting user.
2. **Given** a post with multiple comments, **When** fetching the comments for that post, **Then** comments are returned in ascending chronological order (`createdAt ASC`) with commenter details, content, and creation timestamps.

---

### Edge Cases

- **Empty Content Boundary**: Submitting a post with empty text and no images returns HTTP 400 validation error.
- **Image Attachment Overflow**: Submitting more than 5 image URLs returns HTTP 400 validation error.
- **Single Pinned Post Mutual Exclusion**: If author already has Post A pinned and pins Post B, Post A is automatically unpinned within the same atomic transaction.
- **Soft Deletion of Pinned Post**: When a pinned post is deleted, its `isPinned` flag is cleared and it disappears from the profile feed pinned header.
- **Cursor Pagination Stability**: Keyset cursor `(createdAt, id)` guarantees O(1) database lookups at any feed depth, preventing offset scan degradation and eliminating phantom duplicates when new posts are inserted concurrently.
- **Comment Text Boundary**: Comments with 0 characters or exceeding 500 characters are rejected with a 400 validation error.
- **Author Self-Like**: Users can like their own posts; duplicate likes by the same user on the same post are prevented via unique constraint `(postId, userId)`.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Flow 1: Posting Flow

- **FR-001**: The system MUST allow authenticated users to create posts with text content (1-2000 characters), image URLs (1-5 URLs), or both.
- **FR-002**: The system MUST validate that every post contains at least non-empty text content or at least one image attachment.
- **FR-003**: The system MUST store attached media references as an array of validated URL strings directly on the post record.
- **FR-004**: The system MUST allow authors to toggle the pinned status (`isPinned`) of their posts, enforcing a hard limit of at most 1 active pinned post per user profile.
- **FR-005**: The system MUST allow post authors to soft-delete their own posts (`deletedAt`), immediately excluding them from all active feeds, searches, and detail queries.
- **FR-006**: The system MUST allow authenticated users to submit comments (1-500 characters) on any active post.
- **FR-007**: The system MUST allow authenticated users to like and unlike any active post, enforcing that a user can like a post at most once.
- **FR-008**: The system MUST atomically maintain and update aggregate engagement counters (`likeCount`, `commentCount`) directly on the post record.

#### Flow 2: Feeds Flow

- **FR-009**: The system MUST provide a timeline/discovery feed prioritized by a 3-tier social affinity hierarchy:
  1. Tier 1: Mutual Matches (both users swiped right)
  2. Tier 2: Swiped Profiles (current viewer swiped right on author)
  3. Tier 3: Strangers (authors neither matched nor swiped right)
  Within each tier, posts MUST be sorted in descending chronological order (`createdAt DESC, id DESC`).
- **FR-010**: The system MUST provide an author profile feed returning the author's pinned post first (if present), followed by unpinned active posts ordered newest to oldest.
- **FR-011**: The system MUST support cursor-based (keyset) pagination for timeline feeds using a composite cursor of `(tier, createdAt, id)`, returning a `nextCursor` and a `hasMore` indicator.
- **FR-012**: The system MUST provide a post detail view including full post content, author profile information, engagement counts, and comment thread ordered chronologically (`createdAt ASC`).
- **FR-013**: The system MUST resolve all feed queries, sorting, filtering, and counter aggregation directly using PostgreSQL relational capabilities, with no external cache or message queue dependencies required for feed delivery.

---

### Key Entities

- **Post**:
  - `id`: Unique identifier (UUID).
  - `authorId`: Foreign key reference to author's user profile (UUID).
  - `content`: Text body of post (String, max 2000 characters, nullable if media attached).
  - `mediaUrls`: List of image URL strings (Array of Strings, 0-5 items).
  - `isPinned`: Boolean flag indicating if post is pinned on author's profile (Default: `false`).
  - `likeCount`: Atomic integer count of likes (Default: `0`).
  - `commentCount`: Atomic integer count of comments (Default: `0`).
  - `createdAt`: ISO 8601 creation timestamp.
  - `updatedAt`: ISO 8601 last update timestamp.
  - `deletedAt`: Optional timestamp marking soft deletion (Nullable).

- **Comment**:
  - `id`: Unique identifier (UUID).
  - `postId`: Foreign key reference to parent Post (UUID).
  - `authorId`: Foreign key reference to commenter's user profile (UUID).
  - `content`: Text content of comment (String, 1-500 characters).
  - `createdAt`: ISO 8601 creation timestamp.
  - `deletedAt`: Optional timestamp marking soft deletion (Nullable).

- **PostLike**:
  - `id`: Unique identifier (UUID).
  - `postId`: Foreign key reference to parent Post (UUID).
  - `userId`: Foreign key reference to user profile who liked (UUID).
  - `createdAt`: ISO 8601 creation timestamp.
  - *Unique Constraint*: `(postId, userId)` ensures single like per user per post.

- **Swipe**:
  - `id`: Unique identifier (UUID).
  - `swiperId`: User who initiated the swipe (UUID).
  - `targetId`: User who was swiped on (UUID).
  - `isLike`: Boolean indicating if user swiped right (`true`) or left (`false`).
  - `createdAt`: ISO 8601 timestamp.
  - *Unique Constraint*: `(swiperId, targetId)`.

- **Match**:
  - `id`: Unique identifier (UUID).
  - `user1Id`: First matched user (UUID).
  - `user2Id`: Second matched user (UUID).
  - `createdAt`: ISO 8601 timestamp.
  - *Unique Constraint*: `(user1Id, user2Id)`.

- **FeedPage**:
  - `items`: List of post representations with author profile snapshot, relationship badge (`"MATCHED" | "SWIPED" | "STRANGER"`), and user interaction flags.
  - `pagination`: Keyset pagination object containing `limit`, `nextCursor` (encoding `tier_createdAt_id`), and `hasMore`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Post creation requests complete and return a response in under 200 milliseconds.
- **SC-002**: Timeline feed queries returning a page of 20 posts with author metadata and engagement counts execute in under 100 milliseconds directly via PostgreSQL.
- **SC-003**: Profile feed queries returning pinned and chronological posts execute in under 75 milliseconds.
- **SC-004**: Toggling pin status on a post reflects in feed queries immediately (under 50 milliseconds).
- **SC-005**: 100% of soft-deleted posts are immediately omitted from feed queries without manual cache purges.
- **SC-006**: Continuous infinite scrolling achieves zero duplicate posts and zero skipped posts across page transitions.

---

## Assumptions & Technical Constraints

- **A-001 ("PostgreSQL for Everything")**: All feed retrieval, sorting, filtering, counter maintenance, and cursor pagination MUST be fulfilled natively within PostgreSQL using optimized compound B-Tree indexes, avoiding external caching layers (such as Redis fan-out) or secondary search engines.
- **A-002 (Media Storage)**: Image binary uploads are completed prior to post submission via cloud storage pre-signed URLs or dedicated media service; the post creation API receives validated URL strings.
- **A-003 (Authentication & Identity)**: Author identity (`authorId` / `userId`) is securely extracted from the authenticated JWT session context on all protected endpoints.
- **A-004 (Compound Indexing Strategy)**: PostgreSQL performance targets are guaranteed by composite indexes on:
  - Timeline Feed: `(deleted_at, created_at DESC, id DESC)`
  - Profile Feed: `(author_id, deleted_at, is_pinned DESC, created_at DESC)`
  - Comments: `(post_id, deleted_at, created_at ASC)`
  - Likes: Unique `(post_id, user_id)`
