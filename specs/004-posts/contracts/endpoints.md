# API Endpoints Contract: Post & Comment Management (Posting Domain)

All endpoints require JWT bearer authentication (`Authorization: Bearer <token>`) and wrap responses using VibeU's standard API response envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-08-17T16:00:00.000Z"
}
```

---

## 1. Create Post

* **Route**: `POST /api/v1/posts`
* **Auth**: Required (`USER`)
* **Request Body**:
```json
{
  "content": "Share your status here",
  "mediaUrls": [
    "https://storage.vibeu.app/posts/image1.jpg"
  ]
}
```
* **Validation**:
  * `content` (optional): string, max 2000 chars.
  * `mediaUrls` (optional): array of valid URL strings, max 5 elements.
  * At least one of `content` or `mediaUrls` MUST be provided.

* **Response** (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Post created successfully",
  "data": {
    "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "authorId": "usr_987654321",
    "content": "Share your status here",
    "mediaUrls": [
      "https://storage.vibeu.app/posts/image1.jpg"
    ],
    "isPinned": false,
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2026-08-17T16:00:00.000Z",
    "updatedAt": "2026-08-17T16:00:00.000Z",
    "author": {
      "userId": "abc123",
      "fullName": "abc",
      "avatarSeed": "adventurer-seed-1"
    }
  }
}
```

---

## 2. Get User Profile Feed

* **Route**: `GET /api/v1/posts/feed`
* **Auth**: Required
* **Query Parameters**:
  * `authorId` (optional): User ID whose posts to view. Defaults to current authenticated user.
  * `limit` (optional): Integer (default `20`, max `50`).
  * `skip` (optional): Integer (default `0`).

* **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Feed retrieved successfully",
  "data": {
    "posts": [
      {
        "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
        "authorId": "usr_987654321",
        "content": "Pinned post content",
        "mediaUrls": ["https://storage.vibeu.app/posts/image1.jpg"],
        "isPinned": true,
        "likeCount": 1,
        "commentCount": 2,
        "createdAt": "2026-07-20T11:30:00.000Z",
        "updatedAt": "2026-07-20T11:30:00.000Z",
        "author": {
          "userId": "abc123",
          "fullName": "abc123",
          "avatarSeed": "adventurer-seed-1"
        }
      }
    ],
    "total": 1
  }
}
```

---

## 3. Pin or Unpin Post

* **Route**: `PATCH /api/v1/posts/:id/pin`
* **Auth**: Required (Post author only)
* **Request Body**:
```json
{
  "isPinned": true
}
```

* **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Post pin status updated",
  "data": {
    "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "isPinned": true,
    "updatedAt": "2026-08-17T16:05:00.000Z"
  }
}
```
* **Error Responses**:
  * `403 Forbidden`: User is not the author of the post.
  * `404 Not Found`: Post does not exist or has been deleted.

---

## 4. Delete Post

* **Route**: `DELETE /api/v1/posts/:id`
* **Auth**: Required (Post author only)

* **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Post deleted successfully",
  "data": null
}
```
* **Error Responses**:
  * `403 Forbidden`: User is not the author of the post.
  * `404 Not Found`: Post does not exist or already deleted.

---

## 5. Add Comment to Post

* **Route**: `POST /api/v1/posts/:id/comments`
* **Auth**: Required (`USER`)
* **Request Body**:
```json
{
  "content": "ABC123"
}
```
* **Validation**: `content` string, 1 to 500 characters.

* **Response** (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": {
    "id": "cmt_789456123",
    "postId": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "authorId": "usr_987654321",
    "content": "ABC123",
    "createdAt": "2026-07-20T12:07:00.000Z",
    "author": {
      "userId": "abc",
      "fullName": "abc",
      "avatarSeed": "adventurer-seed-2"
    }
  }
}
```

---

## 6. List Comments for Post

* **Route**: `GET /api/v1/posts/:id/comments`
* **Auth**: Required
* **Query Parameters**:
  * `limit` (optional): Integer (default `20`, max `100`).
  * `skip` (optional): Integer (default `0`).

* **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "cmt_789456123",
        "postId": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
        "authorId": "usr_987654321",
        "content": "ABC123",
        "createdAt": "2026-07-20T12:07:00.000Z",
        "author": {
          "userId": "abc",
          "fullName": "abc",
          "avatarSeed": "adventurer-seed-2"
        }
      }
    ],
    "total": 1
  }
}
```
