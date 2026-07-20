# Quickstart: Verifying User Profiling & AI Matching

This guide defines how to run, verify, and validate the User Profiling functionality end-to-end.

## Prerequisites

1. PostgreSQL database running and database migrated.
2. NestJS application started with `npm run start:dev`.
3. Set the `GEMINI_API_KEY` environment variable in `.env`.
4. Authenticate a user and acquire a bearer token (`<JWT>`).

## Setup and Seeding Data

To run these verification steps, ensure the database is seeded with questions, tags, and archetypes.
Run the database seed script:
```bash
npx prisma db seed
```

## E2E Validation Flow

### Step 1: Verify Available Hobby Tags
Request the available tags dictionary:
```bash
curl -X GET http://localhost:3000/api/v1/profile/hobbies \
  -H "Authorization: Bearer <JWT>"
```
**Expected Outcome**: Responds with `statusCode: 200` containing an array of categorized hobby tags.

---

### Step 2: Verify Questionnaire Fetching
Request the setup questionnaire:
```bash
curl -X GET http://localhost:3000/api/v1/profile/questionnaire \
  -H "Authorization: Bearer <JWT>"
```
**Expected Outcome**: Responds with `statusCode: 200` containing 5 questions and their pre-defined choice options.

---

### Step 3: Create Profile (Basic Details)
Initialize the user profile:
```bash
curl -X POST http://localhost:3000/api/v1/profile/basic \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "TestingUser",
    "gender": "FEMALE",
    "avatarSeed": "test-avatar-123",
    "birthday": "2002-06-15T00:00:00.000Z"
  }'
```
**Expected Outcome**: Responds with `statusCode: 201`, returning the calculated age (e.g. `24` years old) and calculated zodiac sign (`Gemini`).

---

### Step 4: Associate Hobby Tags
Assign hobbies to the profile:
```bash
curl -X POST http://localhost:3000/api/v1/profile/hobbies \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "tagIds": ["<id-tag-1>", "<id-tag-2>", "<id-tag-3>"]
  }'
```
**Expected Outcome**: Responds with `statusCode: 201` containing `"savedCount": 3`.

---

### Step 5: Submit Answers & Retrieve AI Personality Match
Submit the answers to trigger AI classification:
```bash
curl -X POST http://localhost:3000/api/v1/profile/questionnaire/submit \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "questionId": "<id-q-1>", "selectedOptionId": "<id-opt-1>" },
      { "questionId": "<id-q-2>", "selectedOptionId": "<id-opt-3>" },
      { "questionId": "<id-q-3>", "selectedOptionId": "<id-opt-5>" },
      { "questionId": "<id-q-4>", "selectedOptionId": "<id-opt-7>" },
      { "questionId": "<id-q-5>", "selectedOptionId": "<id-opt-9>" }
    ]
  }'
```
**Expected Outcome**: Responds with `statusCode: 201`. The `isCompleted` field is `true`, and the response returns a valid `personalityArchetype` object matching one of the seeded items.

## Automated Verification

Run unit tests for the Use Case/Service layer:
```bash
npm run test
```
Run e2e tests specifically for the profile controller:
```bash
npm run test:e2e
```
