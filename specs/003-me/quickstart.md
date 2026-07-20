# Quickstart: Verifying Profile Edit

This guide defines the validation flow for verifying the Profile Dashboard and Details update APIs.

## Prerequisites

1. PostgreSQL database running and database migrated.
2. NestJS application started (`npm run start:dev`).
3. Active user authenticated to get `<JWT>`.

---

## E2E Validation Flow

### Step 1: Retrieve Me Dashboard
Retrieve initial dashboard statistics and properties:
```bash
curl -X GET http://localhost:3000/api/v1/profile/me \
  -H "Authorization: Bearer <JWT>"
```
**Expected Outcome**: Responds with `statusCode: 200` returning user avatar, nickname, tags, AI archetype, and aggregate post/match stats.

---

### Step 2: Edit Profile Details
Update nickname, bio, avatar, and birthday:
```bash
curl -X PATCH http://localhost:3000/api/v1/profile/me \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "new_nick",
    "bio": "I love coding backend systems.",
    "avatarSeed": "avatar-seed-updated-2",
    "birthday": "2006-07-07T00:00:00.000Z"
  }'
```
**Expected Outcome**: Responds with `statusCode: 200` containing updated values and recalculated age/zodiac details.

---

### Step 3: Verify Read-Only Safeguards
Attempt to update the gender (`gender`) or archetype (`personalityArchetypeId`) manually:
```bash
curl -X PATCH http://localhost:3000/api/v1/profile/me \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "FEMALE"
  }'
```
**Expected Outcome**: The request is either ignored (read-only columns are not mutated in database) or rejected with a bad request depending on controller configuration. Verify the gender remains unchanged.

---

### Step 4: Update Profile Hobby Tags
Modify selected interests:
```bash
curl -X PUT http://localhost:3000/api/v1/profile/me/tags \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "tagIds": ["<tag-id-1>", "<tag-id-2>", "<tag-id-3>"]
  }'
```
**Expected Outcome**: Responds with `statusCode: 200` returning `updatedCount: 3`. An attempt with fewer than 3 tags returns a validation error.
