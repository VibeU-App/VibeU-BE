# API Contracts: Profile

This document defines the HTTP endpoints exposed by the backend for user profile updates.

All responses use the Envelope Pattern:
```json
{
  "metadata": {
    "timestamp": "2026-07-20T23:00:00Z",
    "path": "/api/v1/...",
    "version": "1.0.0"
  },
  "data": { ... },
  "statusCode": 200,
  "message": "Success"
}
```

---

## 1. Get Me Profile Dashboard
Retrieves dashboard data including nickname, avatar, biography, tags, AI archetype, computed fields, and aggregations.

- **URL**: `/api/v1/profile/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response `data` format**:
  ```json
  {
    "profile": {
      "id": "uuid-profile-1",
      "nickname": "abc123",
      "gender": "MALE",
      "avatarSeed": "avatar-seed-abc",
      "birthday": "2006-07-07T00:00:00.000Z",
      "bio": "Describe yourself in 1 sentence",
      "age": 20,
      "zodiac": "Cancer",
      "vibeArchetype": {
        "id": "uuid-archetype-lotus",
        "name": "Lotus"
      },
      "tags": [
        { "id": "uuid-tag-taurus", "name": "Taurus" },
        { "id": "uuid-tag-introvert", "name": "Introverted" }
      ],
      "stats": {
        "outpostCount": 0,
        "matchlistCount": 1
      }
    }
  }
  ```

---

## 2. Update Profile Details
Updates nickname, bio, birthday, and avatar seed. Enforces read-only gender and archetype.

- **URL**: `/api/v1/profile/me`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
  ```json
  {
    "nickname": "abc123_new",
    "bio": "Updated introduction bio.",
    "avatarSeed": "new-avatar-seed",
    "birthday": "2006-07-07T00:00:00.000Z"
  }
  ```
- **Response `data` format**:
  ```json
  {
    "profile": {
      "id": "uuid-profile-1",
      "nickname": "abc123_new",
      "gender": "MALE",
      "avatarSeed": "new-avatar-seed",
      "birthday": "2006-07-07T00:00:00.000Z",
      "bio": "Updated introduction bio.",
      "age": 20,
      "zodiac": "Cancer"
    }
  }
  ```

---

## 3. Update Profile Hobbies & Tags
Updates the associated interest tags. Must select between 3 and 10 tags.

- **URL**: `/api/v1/profile/me/tags`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
  ```json
  {
    "tagIds": [
      "uuid-tag-1",
      "uuid-tag-2",
      "uuid-tag-3"
    ]
  }
  ```
- **Response `data` format**:
  ```json
  {
    "updatedCount": 3
  }
  ```
