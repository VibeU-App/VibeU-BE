# API Endpoints Contract: Post & Feed Management (Posting Domain)

All endpoints require JWT bearer authentication (`Authorization: Bearer <token>`) and strictly format responses using VibeU's standard API response envelope:
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:00:00.000Z",
    "path": "/api/v1/posts/timeline",
    "version": "1.0.0"
  },
  "data": { ... },
  "statusCode": 200,
  "message": "Operation description"
}
```

---

## Flow 1: Posting Flow

### 1. Create Post
* **Route**: `POST /api/v1/posts`
* **Auth**: Required (`USER`)
* **Request Body**:
```json
{
  "content": "Hey VibeU community! Check out my first day on campus.",
  "mediaUrls": [
    "https://storage.vibeu.app/posts/image1.jpg",
    "https://storage.vibeu.app/posts/image2.jpg"
  ]
}
```
* **Validation Rules**:
  * `content` (optional): String, 1 to 2000 characters.
  * `mediaUrls` (optional): Array of valid HTTPS URL strings, 1 to 5 elements.
  * At least one of `content` or `mediaUrls` MUST be provided.
* **Response** (`201 Created`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:00:00.000Z",
    "path": "/api/v1/posts",
    "version": "1.0.0"
  },
  "statusCode": 201,
  "message": "Post created successfully",
  "data": {
    "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "authorId": "usr_987654321",
    "content": "Hey VibeU community! Check out my first day on campus.",
    "mediaUrls": [
      "https://storage.vibeu.app/posts/image1.jpg",
      "https://storage.vibeu.app/posts/image2.jpg"
    ],
    "isPinned": false,
    "likeCount": 0,
    "commentCount": 0,
    "hasLiked": false,
    "createdAt": "2026-09-13T07:00:00.000Z",
    "updatedAt": "2026-09-13T07:00:00.000Z",
    "author": {
      "userId": "usr_987654321",
      "fullName": "Ryan Phan",
      "avatarSeed": "adventurer-seed-1"
    }
  }
}
```

---

### 2. Pin / Unpin Post
* **Route**: `PATCH /api/v1/posts/:id/pin`
* **Auth**: Required (Author only)
* **Request Body**:
```json
{
  "isPinned": true
}
```
* **Validation Rules**:
  * `isPinned`: Boolean (required).
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:05:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d/pin",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Post pin status updated successfully",
  "data": {
    "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "isPinned": true,
    "updatedAt": "2026-09-13T07:05:00.000Z"
  }
}
```
* **Errors**:
  * `403 Forbidden`: Authenticated user is not the author of the post.
  * `404 Not Found`: Post does not exist or has been soft-deleted.

---

### 3. Soft Delete Post
* **Route**: `DELETE /api/v1/posts/:id`
* **Auth**: Required (Author only)
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:10:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Post deleted successfully",
  "data": null
}
```
* **Errors**:
  * `403 Forbidden`: Authenticated user is not the author of the post.
  * `404 Not Found`: Post does not exist or has already been deleted.

---

### 4. Toggle Like on Post
* **Route**: `POST /api/v1/posts/:id/like`
* **Auth**: Required (`USER`)
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:15:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d/like",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Post like toggled successfully",
  "data": {
    "postId": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "hasLiked": true,
    "likeCount": 1
  }
}
```
* **Behavior**: If user has not liked the post, adds like and increments `likeCount`. If user already liked, removes like and decrements `likeCount`.

---

### 5. Add Comment to Post
* **Route**: `POST /api/v1/posts/:id/comments`
* **Auth**: Required (`USER`)
* **Request Body**:
```json
{
  "content": "Welcome to VibeU! Glad to have you here."
}
```
* **Validation Rules**:
  * `content`: String, 1 to 500 characters (required).
* **Response** (`201 Created`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:20:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d/comments",
    "version": "1.0.0"
  },
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": {
    "id": "cmt_789456123",
    "postId": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "authorId": "usr_123456789",
    "content": "Welcome to VibeU! Glad to have you here.",
    "createdAt": "2026-09-13T07:20:00.000Z",
    "author": {
      "userId": "usr_123456789",
      "fullName": "Sarah Connor",
      "avatarSeed": "adventurer-seed-2"
    }
  }
}
```

---

## Flow 2: Feeds Flow

### 6. Timeline / Discovery Feed (3-Tier Relationship Keyset Pagination)
* **Route**: `GET /api/v1/posts/timeline`
* **Auth**: Required (`USER`)
* **Behavior**: Returns posts prioritized across 3 social affinity tiers:
  1. **Tier 1 (`MATCHED`)**: Authors with mutual right swipes.
  2. **Tier 2 (`SWIPED`)**: Authors the viewer swiped right on (pending match).
  3. **Tier 3 (`STRANGER`)**: Other campus users.
  Within each tier, posts are sorted in descending chronological order (`createdAt DESC, id DESC`).
* **Query Parameters**:
  * `limit` (optional): Integer between 1 and 50 (default: `20`).
  * `cursor` (optional): Opaque base64 cursor token encoding `(tier, createdAt, id)` of the last post received.
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:25:00.000Z",
    "path": "/api/v1/posts/timeline",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Timeline feed retrieved successfully",
  "data": {
    "items": [
      {
        "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
        "authorId": "usr_987654321",
        "content": "Hey VibeU community! Check out my first day on campus.",
        "mediaUrls": [
          "https://storage.vibeu.app/posts/image1.jpg"
        ],
        "isPinned": false,
        "likeCount": 12,
        "commentCount": 3,
        "hasLiked": true,
        "relation": "MATCHED",
        "createdAt": "2026-09-13T07:00:00.000Z",
        "updatedAt": "2026-09-13T07:00:00.000Z",
        "author": {
          "userId": "usr_987654321",
          "fullName": "Ryan Phan",
          "avatarSeed": "adventurer-seed-1"
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "nextCursor": "MV8yMDI2LTA5LTEzVDA3OjAwOjAwLjAwMFpfYzFmN2EyYjAtOGUxZC00YjkyLTlhM2QtMWU1ZjhhMmIzYzRk",
      "hasMore": true
    }
  }
}
```

---

### 7. User Profile Feed
* **Route**: `GET /api/v1/posts/profile/:authorId`
* **Auth**: Required (`USER`)
* **Query Parameters**:
  * `limit` (optional): Integer between 1 and 50 (default: `20`).
  * `cursor` (optional): Keyset cursor for older posts.
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:30:00.000Z",
    "path": "/api/v1/posts/profile/usr_987654321",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Profile feed retrieved successfully",
  "data": {
    "pinnedPost": {
      "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
      "authorId": "usr_987654321",
      "content": "Featured Showcase Post on my profile!",
      "mediaUrls": ["https://storage.vibeu.app/posts/image1.jpg"],
      "isPinned": true,
      "likeCount": 42,
      "commentCount": 7,
      "hasLiked": false,
      "createdAt": "2026-09-10T12:00:00.000Z",
      "updatedAt": "2026-09-10T12:00:00.000Z",
      "author": {
        "userId": "usr_987654321",
        "fullName": "Ryan Phan",
        "avatarSeed": "adventurer-seed-1"
      }
    },
    "items": [
      {
        "id": "d2e8b3c1-9f2e-5c03-0b4e-2f6g9b3c4d5e",
        "authorId": "usr_987654321",
        "content": "Recent update from yesterday.",
        "mediaUrls": [],
        "isPinned": false,
        "likeCount": 5,
        "commentCount": 1,
        "hasLiked": false,
        "createdAt": "2026-09-12T18:30:00.000Z",
        "updatedAt": "2026-09-12T18:30:00.000Z",
        "author": {
          "userId": "usr_987654321",
          "fullName": "Ryan Phan",
          "avatarSeed": "adventurer-seed-1"
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "nextCursor": "MjAyNi0wOS0xMlQxODozMDowMC4wMDBaX2QyZThiM2MxLTlmMmUtNWMwMy0wYjRlLTJmNmc5YjNjNGQ1ZQ==",
      "hasMore": false
    }
  }
}
```

---

### 8. Get Post Details
* **Route**: `GET /api/v1/posts/:id`
* **Auth**: Required (`USER`)
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:35:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Post retrieved successfully",
  "data": {
    "id": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
    "authorId": "usr_987654321",
    "content": "Hey VibeU community! Check out my first day on campus.",
    "mediaUrls": [
      "https://storage.vibeu.app/posts/image1.jpg"
    ],
    "isPinned": false,
    "likeCount": 12,
    "commentCount": 3,
    "hasLiked": true,
    "createdAt": "2026-09-13T07:00:00.000Z",
    "updatedAt": "2026-09-13T07:00:00.000Z",
    "author": {
      "userId": "usr_987654321",
      "fullName": "Ryan Phan",
      "avatarSeed": "adventurer-seed-1"
    }
  }
}
```

---

### 9. List Comments for Post
* **Route**: `GET /api/v1/posts/:id/comments`
* **Auth**: Required (`USER`)
* **Query Parameters**:
  * `limit` (optional): Integer between 1 and 100 (default: `20`).
  * `cursor` (optional): Cursor for chronological comments pagination.
* **Response** (`200 OK`):
```json
{
  "metadata": {
    "timestamp": "2026-09-13T07:40:00.000Z",
    "path": "/api/v1/posts/c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d/comments",
    "version": "1.0.0"
  },
  "statusCode": 200,
  "message": "Comments retrieved successfully",
  "data": {
    "items": [
      {
        "id": "cmt_789456123",
        "postId": "c1f7a2b0-8e1d-4b92-9a3d-1e5f8a2b3c4d",
        "authorId": "usr_123456789",
        "content": "Welcome to VibeU! Glad to have you here.",
        "createdAt": "2026-09-13T07:20:00.000Z",
        "author": {
          "userId": "usr_123456789",
          "fullName": "Sarah Connor",
          "avatarSeed": "adventurer-seed-2"
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "nextCursor": null,
      "hasMore": false
    }
  }
}
```
