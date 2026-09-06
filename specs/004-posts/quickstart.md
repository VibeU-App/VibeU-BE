# Quickstart & Verification Guide: Post & Comment Management (Posting Domain)

This guide provides runnable scenarios to verify the Post & Comment Management feature end-to-end.

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
   npx prisma migrate dev --name add_posts_and_comments
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

---

## Verification Scenarios

### Scenario 1: Create a Post with Text & Images

* **Action**: Execute `POST /api/v1/posts` with valid JWT token:
  ```json
  {
    "content": "Share your status",
    "mediaUrls": ["https://storage.vibeu.app/demo.jpg"]
  }
  ```
* **Expected Result**: HTTP `201 Created` with created post payload, `isPinned: false`, `likeCount: 0`, and `commentCount: 0`.

---

### Scenario 2: Pin a Post & Verify Feed Order

1. **Pin Action**: Execute `PATCH /api/v1/posts/:postId/pin` with `{ "isPinned": true }`.
2. **Feed Query**: Execute `GET /api/v1/posts/feed`.
3. **Expected Result**: Pinned post appears first in the list regardless of creation date. Any previously pinned post for the same user is automatically unpinned.

---

### Scenario 3: Add Comment & Verify Count Update

1. **Add Comment**: Execute `POST /api/v1/posts/:postId/comments` with `{ "content": "Great post!" }`.
2. **Feed Re-check**: Execute `GET /api/v1/posts/feed`.
3. **Expected Result**: `commentCount` on the post increases from `0` to `1`. `GET /api/v1/posts/:postId/comments` returns the new comment.

---

### Scenario 4: Delete Post

1. **Delete Action**: Execute `DELETE /api/v1/posts/:postId`.
2. **Expected Result**: HTTP `200 OK`. Subsequent calls to `GET /api/v1/posts/feed` or `GET /api/v1/posts/:postId/comments` return `404 Not Found` or omit the post.

---

## Automated Test Execution

Run use-case unit tests:
```bash
npm run test -- src/use-cases/post/
```
