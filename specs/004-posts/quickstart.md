# Quickstart & Verification Guide: Post & Feed Management (Posting Domain)

This guide provides runnable verification scenarios to validate the Post & Feed Management feature end-to-end across both flows: **Posting Flow** and **Feeds Flow** (with 3-tier social affinity and direct PostgreSQL Keyset pagination).

---

## References

* **Specification**: [`spec.md`](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/spec.md)
* **Implementation Plan**: [`plan.md`](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/plan.md)
* **Data Model**: [`data-model.md`](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/data-model.md)
* **API Contracts**: [`contracts/endpoints.md`](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/contracts/endpoints.md)

---

## Environment Setup

1. **Apply Database Migration**:
   ```bash
   pnpm prisma migrate dev --name add_posts_feeds_likes_and_swipes
   ```

2. **Generate Prisma Client & CJS Fix**:
   ```bash
   pnpm generate
   ```

---

## Verification Scenarios

### Flow 1: Posting Flow

#### Scenario 1: Create a Post with Text & Media
* **Action**: Execute `POST /api/v1/posts` with JWT token:
  ```json
  {
    "content": "Excited to join VibeU!",
    "mediaUrls": ["https://storage.vibeu.app/posts/image1.jpg"]
  }
  ```
* **Expected Result**: HTTP `201 Created` with envelope structure:
  - `data.content`: `"Excited to join VibeU!"`
  - `data.mediaUrls`: `["https://storage.vibeu.app/posts/image1.jpg"]`
  - `data.likeCount`: `0`
  - `data.commentCount`: `0`
  - `data.isPinned`: `false`

#### Scenario 2: Toggle Like on Post
1. **Like Action**: `POST /api/v1/posts/:postId/like`
   - **Expected**: `data.hasLiked: true`, `data.likeCount: 1`.
2. **Unlike Action**: `POST /api/v1/posts/:postId/like`
   - **Expected**: `data.hasLiked: false`, `data.likeCount: 0`.

#### Scenario 3: Pin a Post & Atomic Unpinning
1. **Pin Action**: Execute `PATCH /api/v1/posts/:postId/pin` with `{ "isPinned": true }`.
2. **Expected**: Post `isPinned` becomes `true`. Any other post previously pinned by the same author automatically has `isPinned` set to `false`.

#### Scenario 4: Soft-Delete Post
1. **Delete Action**: Execute `DELETE /api/v1/posts/:postId`.
2. **Expected**: HTTP `200 OK`. Subsequent queries to `GET /api/v1/posts/:postId` or timeline feeds omit the post immediately.

---

### Flow 2: Feeds Flow

#### Scenario 5: 3-Tier Timeline Feed (Matched -> Swiped -> Strangers)
1. **Setup**:
   - User A (Viewer).
   - User B: Mutually matched with User A (`matches` entry exists).
   - User C: User A swiped right on User C (`swipes.is_like = true`), no mutual match.
   - User D: Stranger (User A has not swiped right on User D).
   - Users B, C, and D each publish a post.
2. **First Page Query**: `GET /api/v1/posts/timeline?limit=1`
   - **Expected**: Post from User B arrives first with `relation: "MATCHED"`, plus `nextCursor` encoding Tier 1 cursor.
3. **Second Page Query**: `GET /api/v1/posts/timeline?limit=1&cursor={nextCursor}`
   - **Expected**: Post from User C arrives next with `relation: "SWIPED"`, plus `nextCursor` encoding Tier 2 cursor.
4. **Third Page Query**: `GET /api/v1/posts/timeline?limit=1&cursor={nextCursor}`
   - **Expected**: Post from User D arrives next with `relation: "STRANGER"`.

#### Scenario 6: Profile Feed with Pinned Post
1. **Profile Query**: `GET /api/v1/posts/profile/:authorId?limit=10`
   - **Expected**: 
     - If author has a pinned post: `data.pinnedPost` contains the pinned post, and `data.items` contains remaining posts sorted chronologically.
     - If author has no pinned post: `data.pinnedPost` is `null`.

#### Scenario 7: Post Comments Chronological Feed
1. **Add Comments**: Create 2 comments on a post.
2. **Comment Query**: `GET /api/v1/posts/:postId/comments?limit=20`
   - **Expected**: Returns comments in ascending chronological order (`createdAt ASC`) with commenter avatar and nickname.

---

## Automated Test Execution

Run all use-case unit tests in pure TypeScript:
```bash
pnpm test src/use-cases/post/
```
