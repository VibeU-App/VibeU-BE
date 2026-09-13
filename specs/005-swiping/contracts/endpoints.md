# API Contract: Profile Swiping & Matching (Swiping Domain)

**Base URL**: `/api/v1/swipes`  
**Authentication**: Bearer JWT (Access Token in `Authorization` header)  
**Standard Envelope**: Every response adheres strictly to VibeU Constitution Envelope Pattern:
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:30:00.000Z",
    "path": "/api/v1/...",
    "version": "1.0.0"
  },
  "data": { ... },
  "statusCode": 200,
  "message": "Success"
}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/swipes` | Submit a swipe decision (`LIKE` or `PASS`) on a candidate | Yes |
| `GET` | `/api/v1/swipes/deck` | Fetch candidate profile cards (strictly opposite-sex) | Yes |
| `GET` | `/api/v1/swipes/matches` | Fetch all active mutual matches for the authenticated user | Yes |
| `DELETE` | `/api/v1/swipes/matches/:matchId` | Unmatch an existing connection | Yes |

---

## 1. Submit Swipe Decision

Records a user's swipe (`LIKE` or `PASS`). If `LIKE` and a reciprocal like exists, immediately creates a mutual match.

- **Method**: `POST`
- **Path**: `/api/v1/swipes`
- **Status Code**: `201 Created`

### Request Body (`CreateSwipeDto`)
```json
{
  "targetUserId": "c4938a9d-114d-44a6-98dc-a7e8e50b1a03",
  "isLike": true
}
```

| Field | Type | Required | Description | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `targetUserId` | `string` (UUID) | Yes | User ID of the candidate being swiped | Must not equal requester ID; must exist; must have opposite sex |
| `isLike` | `boolean` | Yes | `true` for Swipe Right (Like), `false` for Swipe Left (Pass) | Boolean |

### Response (`201 Created` - Reciprocal Match Formed)
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:30:00.000Z",
    "path": "/api/v1/swipes",
    "version": "1.0.0"
  },
  "data": {
    "isMatch": true,
    "swipeId": "8f2a64c0-3b12-42fe-b58a-81a2f1c8b394",
    "match": {
      "id": "e932ba01-7ec4-4903-b09b-640a3e9c608f",
      "matchedAt": "2026-09-13T15:30:00.000Z",
      "matchedUser": {
        "userId": "c4938a9d-114d-44a6-98dc-a7e8e50b1a03",
        "nickname": "Alex",
        "avatarSeed": "alex_seed_99",
        "university": "Hanoi University of Science and Technology",
        "archetypeName": "The Innovator"
      }
    }
  },
  "statusCode": 201,
  "message": "It's a match!"
}
```

### Response (`201 Created` - No Match Formed / Pass)
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:30:00.000Z",
    "path": "/api/v1/swipes",
    "version": "1.0.0"
  },
  "data": {
    "isMatch": false,
    "swipeId": "8f2a64c0-3b12-42fe-b58a-81a2f1c8b394",
    "match": null
  },
  "statusCode": 201,
  "message": "Swipe recorded successfully"
}
```

### Error Responses
- **400 Bad Request**: Self-swipe attempted (`"Cannot swipe on your own profile"`), or opposite-sex rule violated (`"Cannot swipe on users of the same sex"`), or requester profile uncompleted.
- **404 Not Found**: Target profile does not exist or is soft-deleted.
- **409 Conflict**: Target user has already been swiped on (`"You have already swiped on this profile"`).

---

## 2. Fetch Discovery Card Deck

Returns a curated deck of eligible candidate profiles strictly filtered by the opposite sex of the requester.

- **Method**: `GET`
- **Path**: `/api/v1/swipes/deck`
- **Query Parameters**:
  - `limit` (optional, integer, default `15`, min `1`, max `30`): Number of candidate cards to retrieve.
- **Status Code**: `200 OK`

### Response (`200 OK`)
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:31:00.000Z",
    "path": "/api/v1/swipes/deck",
    "version": "1.0.0"
  },
  "data": {
    "candidates": [
      {
        "userId": "d718b2c4-f2a1-432d-8b01-5238a901ff8b",
        "nickname": "Maya",
        "gender": "FEMALE",
        "birthday": "2003-04-12T00:00:00.000Z",
        "age": 23,
        "university": "Foreign Trade University",
        "bio": "Coffee lover, weekend photographer, and tech enthusiast.",
        "avatarSeed": "maya_seeds_42",
        "photos": [
          "https://storage.vibeu.app/profiles/maya_1.webp",
          "https://storage.vibeu.app/profiles/maya_2.webp"
        ],
        "hobbies": [
          "Photography",
          "Specialty Coffee",
          "Badminton"
        ],
        "personalityArchetype": {
          "id": 3,
          "name": "The Creative Explorer",
          "imageUrl": "https://storage.vibeu.app/archetypes/creative_explorer.webp"
        }
      }
    ],
    "count": 1,
    "hasMore": false
  },
  "statusCode": 200,
  "message": "Candidate deck retrieved successfully"
}
```

### Invariants Verified:
- All profiles in `candidates` have gender opposite to the requester.
- None of the candidates have been previously swiped on by the requester.
- Excludes requester profile.
- All candidate accounts are active and completed.

---

## 3. Fetch Mutual Matches List

Retrieves all mutual matches established by the authenticated user, sorted with the most recent matches first (`matchedAt DESC`).

- **Method**: `GET`
- **Path**: `/api/v1/swipes/matches`
- **Status Code**: `200 OK`

### Response (`200 OK`)
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:32:00.000Z",
    "path": "/api/v1/swipes/matches",
    "version": "1.0.0"
  },
  "data": {
    "matches": [
      {
        "matchId": "e932ba01-7ec4-4903-b09b-640a3e9c608f",
        "matchedAt": "2026-09-13T15:30:00.000Z",
        "user": {
          "userId": "c4938a9d-114d-44a6-98dc-a7e8e50b1a03",
          "nickname": "Alex",
          "avatarSeed": "alex_seed_99",
          "university": "Hanoi University of Science and Technology",
          "archetypeName": "The Innovator"
        }
      }
    ],
    "totalCount": 1
  },
  "statusCode": 200,
  "message": "Matches retrieved successfully"
}
```

---

## 4. Unmatch Connection

Removes a mutual match between the authenticated user and a matched connection. Preserves the underlying swipe records so neither user ever reappears in each other's swipe deck.

- **Method**: `DELETE`
- **Path**: `/api/v1/swipes/matches/:matchId`
- **Parameters**:
  - `matchId` (`string`, UUID): ID of the match to remove.
- **Status Code**: `200 OK`

### Response (`200 OK`)
```json
{
  "metadata": {
    "timestamp": "2026-09-13T15:33:00.000Z",
    "path": "/api/v1/swipes/matches/e932ba01-7ec4-4903-b09b-640a3e9c608f",
    "version": "1.0.0"
  },
  "data": {
    "success": true
  },
  "statusCode": 200,
  "message": "Unmatched successfully"
}
```

### Error Responses
- **403 Forbidden**: Requester is neither `user1Id` nor `user2Id` of the match.
- **404 Not Found**: Match does not exist.
