# API Contracts: User Profiling Domain

This document describes the presentation layer contracts (HTTP Endpoints) exposed by the NestJS backend for the Profiling domain.

All successful responses conform to the Envelope Pattern specified in the Project Constitution:
```json
{
  "metadata": {
    "timestamp": "2026-07-20T20:25:00Z",
    "path": "/api/v1/...",
    "version": "1.0.0"
  },
  "data": { ... },
  "statusCode": 200,
  "message": "Success"
}
```

---

## 1. Get Hobby Tags Dictionary
Retrieves the list of all available interest and hobby tags sorted by category.

- **URL**: `/api/v1/profile/hobbies`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response `data` format**:
  ```json
  {
    "tags": [
      {
        "id": "uuid-tag-1",
        "name": "Soccer",
        "category": "SPORT"
      },
      {
        "id": "uuid-tag-2",
        "name": "Introverted",
        "category": "PERSONALITY"
      }
    ]
  }
  ```

---

## 2. Get Questionnaire
Retrieves the active list of profile setup questions and their multiple-choice options.

- **URL**: `/api/v1/profile/questionnaire`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response `data` format**:
  ```json
  {
    "questions": [
      {
        "id": "uuid-q-1",
        "text": "Which team will win the World Cup 2026?",
        "order": 1,
        "options": [
          {
            "id": "uuid-opt-1",
            "text": "Argentina"
          },
          {
            "id": "uuid-opt-2",
            "text": "Brazil"
          }
        ]
      }
    ]
  }
  ```

---

## 3. Submit Basic Details (Sex, Nickname, Birthday, Avatar)
Initializes or updates the core user profile details.

- **URL**: `/api/v1/profile/basic`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
  ```json
  {
    "nickname": "Alex",
    "gender": "MALE",
    "avatarSeed": "dicebear-seed-123",
    "birthday": "2006-01-15T00:00:00.000Z"
  }
  ```
- **Response `data` format**:
  ```json
  {
    "profile": {
      "id": "uuid-profile-1",
      "userId": "uuid-user-123",
      "nickname": "Alex",
      "gender": "MALE",
      "avatarSeed": "dicebear-seed-123",
      "birthday": "2006-01-15T00:00:00.000Z",
      "age": 20,
      "zodiac": "Capricorn",
      "isCompleted": false
    }
  }
  ```

---

## 4. Save Selected Hobby Tags
Saves between 3 and 10 selected interest/hobby tags.

- **URL**: `/api/v1/profile/hobbies`
- **Method**: `POST`
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
    "savedCount": 3
  }
  ```

---

## 5. Submit Questionnaire Answers & Match Personality Archetype
Submits the 5 questionnaire answers. Behind the scenes, the backend runs the AI engine to map the answers and tags to a database archetype, updates the profile as completed, and returns the result.

- **URL**: `/api/v1/profile/questionnaire/submit`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "questionId": "uuid-q-1",
        "selectedOptionId": "uuid-opt-1"
      }
    ]
  }
  ```
- **Response `data` format**:
  ```json
  {
    "profile": {
      "id": "uuid-profile-1",
      "nickname": "Alex",
      "gender": "MALE",
      "avatarSeed": "dicebear-seed-123",
      "birthday": "2006-01-15T00:00:00.000Z",
      "age": 20,
      "zodiac": "Capricorn",
      "isCompleted": true,
      "personalityArchetype": {
        "id": "uuid-archetype-innovator",
        "name": "The Adventurous Innovator",
        "description": "You love trying new technology and exploring the unknown.",
        "traits": ["Innovative", "Curious", "Outgoing"]
      }
    }
  }
  ```

---

## 6. Get Current User Profile
Retrieves the logged-in user's profile details.

- **URL**: `/api/v1/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response `data` format**:
  ```json
  {
    "profile": {
      "id": "uuid-profile-1",
      "userId": "uuid-user-123",
      "nickname": "Alex",
      "gender": "MALE",
      "avatarSeed": "dicebear-seed-123",
      "birthday": "2006-01-15T00:00:00.000Z",
      "age": 20,
      "zodiac": "Capricorn",
      "isCompleted": true,
      "personalityArchetype": {
        "id": "uuid-archetype-innovator",
        "name": "The Adventurous Innovator",
        "description": "You love trying new technology and exploring the unknown.",
        "traits": ["Innovative", "Curious", "Outgoing"]
      }
    }
  }
  ```
