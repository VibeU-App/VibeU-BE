# Technical Research: Profile Swiping & Matching (Swiping Domain)

**Feature**: `005-swiping`  
**Date**: 2026-09-13  
**Status**: Completed  

---

## 1. Candidate Discovery Deck Query & Opposite-Sex Filtering

### Context & Requirements
When a user opens the swipe screen, the system fetches a deck of up to 15 eligible candidate profile cards.
The user requirement explicitly states:
> "remember that just show the user with different sex, like if they are female, the user appear on swipe must be male"

Furthermore, the query must:
1. Show ONLY profiles of the opposite sex (if viewer is `FEMALE`, candidate must be `MALE`; if viewer is `MALE`, candidate must be `FEMALE`).
2. Exclude the viewer's own profile (`userId != viewerId`).
3. Exclude all profiles the viewer has already swiped on (whether `LIKE` or `PASS`).
4. Exclude uncompleted profiles (`isCompleted = true`), soft-deleted users (`deletedAt IS NULL`), and inactive accounts (`accountStatus = ACTIVE`).
5. Include rich presentation data (photos, hobbies, university, bio, personality archetype).

### Decision
Execute a native PostgreSQL query via Prisma using a **`WHERE NOT EXISTS` Anti-Join** combined with an indexed filter on `gender` and account eligibility:

```sql
SELECT 
  p.id,
  p.user_id,
  p.nickname,
  p.gender,
  p.university,
  p.bio,
  p.avatar_seed,
  p.birthday,
  p.personality_archetype_id,
  pa.name AS archetype_name,
  pa.image_url AS archetype_image_url
FROM profiles p
INNER JOIN users u ON u.id = p.user_id
LEFT JOIN personality_archetypes pa ON pa.id = p.personality_archetype_id
WHERE UPPER(p.gender) = UPPER(:oppositeGender)
  AND p.user_id != :viewerUserId
  AND p.is_completed = TRUE
  AND u.deleted_at IS NULL
  AND u.account_status_id = :activeStatusId
  AND NOT EXISTS (
    SELECT 1 
    FROM swipes s 
    WHERE s.swiper_id = :viewerUserId 
      AND s.target_id = p.user_id
  )
ORDER BY p.updated_at DESC
LIMIT :limit;
```

Candidate photos and hobbies are joined or batch-loaded using standard Prisma relation queries for the fetched candidate IDs.

### Rationale
- **Strict Opposite-Sex Enforcement**: Resolving `oppositeGender` from the authenticated user's profile before query execution ensures 100% adherence to the opposite-sex requirement. Normalizing with `UPPER()` guarantees case-insensitive consistency.
- **Index Anti-Join Performance**: With a compound B-tree index on `swipes (swiper_id, target_id)`, PostgreSQL's query optimizer converts `NOT EXISTS` into a fast Hash Anti-Join or Index Anti-Join, filtering out previously swiped profiles in single-digit milliseconds.
- **Null Safety**: Unlike `NOT IN (SELECT target_id ...)`, `NOT EXISTS` handles potential nulls predictably and avoids memory overhead.

### Alternatives Considered
- **Redis Set per User (`SDIFF` / `SINTER`)**: Storing candidate IDs in Redis sets. Rejected because VibeU follows the "PostgreSQL for everything" architecture principle; maintaining Redis cache invalidation for profiles, photos, and swipes introduces unnecessary infrastructure complexity and synchronization drift.
- **Pre-computed Swipe Queues**: Background worker pre-generating queues. Rejected as premature optimization; with indexed relational queries and limit 15, PostgreSQL sub-100ms response times easily satisfy SC-003.

---

## 2. Race Condition Prevention & Canonical Ordering in Mutual Matches

### Context & Requirements
A mutual match occurs when User A swipes right on User B and User B swipes right on User A. If both swipe right on each other simultaneously, concurrent requests could attempt to insert duplicate match rows or trigger database deadlocks (e.g., Thread 1 locks row A then B, Thread 2 locks row B then A).

### Decision
Enforce **Canonical Lexicographical Ordering** of user IDs on the `Match` entity and table:
1. Always store `user1Id` and `user2Id` such that `user1Id < user2Id` (lexicographical string comparison of UUIDs):
   ```typescript
   const [user1Id, user2Id] = swiperId < targetId 
     ? [swiperId, targetId] 
     : [targetId, swiperId];
   ```
2. Define a unique compound index on `matches (user1_id, user2_id)`.
3. Wrap swipe recording and reciprocal match creation in a Prisma interactive transaction (`$transaction`):
   - Insert the `Swipe` record with unique constraint `(swiper_id, target_id)`.
   - If `isLike === true`, query for reciprocal swipe: `WHERE swiper_id = :targetId AND target_id = :swiperId AND is_like = true`.
   - If reciprocal swipe exists, execute an idempotent upsert on `Match`:
     ```typescript
     await tx.match.upsert({
       where: { user1Id_user2Id: { user1Id, user2Id } },
       create: { user1Id, user2Id },
       update: {}, // No-op if already created by concurrent thread
     });
     ```

### Rationale
- **Deterministic Lock Acquisition**: By always ordering `user1Id < user2Id`, all concurrent transactions acquire row/index locks in the identical order, mathematically eliminating the possibility of cyclic deadlocks.
- **Idempotency Guarantee**: The unique composite index `(user1_id, user2_id)` guarantees that exactly one match row can ever exist between any two users, even under heavy concurrency.
- **Fast Bidirectional Match Lookups**: To find matches for User X, we query `WHERE user1_id = :userId OR user2_id = :userId`. With B-Tree indexes on `user1_id` and `user2_id`, PostgreSQL performs an index bitmap union in sub-millisecond time.

### Alternatives Considered
- **Storing Two Match Rows (A->B and B->A)**: Duplicating match records for each direction. Rejected because it doubles write amplification, risks desynchronization on unmatch operations, and complicates count/pagination queries.
- **Distributed Locks (Redlock)**: Using distributed locking. Rejected as unnecessary overhead since PostgreSQL transactional upsert with canonical ordering natively solves concurrency.

---

## 3. Swipe Mutation & Opposite-Sex Validation on Swipe Submission

### Context & Requirements
Even if the discovery deck filters opposite-sex candidates, an API consumer could craft a manual `POST /api/v1/swipes` payload targeting a user of the same sex or non-existent profile.

### Decision
Enforce validation at the Application Layer (Use Case):
1. Load the swiper's profile: verify `isCompleted = true` and retrieve `swiper.gender`.
2. Self-Swipe Check: Reject if `swiperId === targetId` with HTTP 400 Bad Request.
3. Load target user profile: verify existence, account active status, and `target.gender`.
4. Opposite-Sex Invariant Check: Compare `swiper.gender.toUpperCase() === target.gender.toUpperCase()`. If identical, reject with HTTP 400 Bad Request (`"Cannot swipe on users of the same sex"`).
5. Existing Swipe Check: Verify no existing swipe from `swiperId` to `targetId`. If found, throw HTTP 409 Conflict.

### Rationale
- Defends domain business rules independently of presentation deck logic.
- Complies with VibeU Clean Architecture: Domain/Application layer owns business rule validation.

### Alternatives Considered
- **Database CHECK Constraint**: Adding a DB trigger or check comparing genders. Rejected because cross-table check constraints across `swipes` and `profiles` require complex PL/pgSQL triggers that bypass Prisma schema migrations.

---

## 4. Unmatching Behavior & Re-Swiping Prevention

### Context & Requirements
When a user unmatches a connection, the `Match` record is deleted.
Does unmatching delete or preserve the underlying `Swipe` records?
If `Swipe` records are preserved:
- Both users remain in each other's "swiped" list, meaning they will NOT reappear in each other's swipe deck (FR-008, Edge Case: Unmatched Re-Swiping).
- Neither user can swipe on each other again unless explicitly reset.

### Decision
When an unmatch is requested:
1. Verify the requester is either `user1Id` or `user2Id` of the `Match`.
2. Delete the `Match` record.
3. **Preserve** the underlying `Swipe` records (`isLike = true` remains in database).
4. Consequently:
   - The candidate discovery deck query (`NOT EXISTS (SELECT 1 FROM swipes ...)`) automatically continues to exclude both users from ever seeing each other in future swipe decks.
   - Posts feeds Tier 1 (matched) ceases to apply; Tier 2 (swiped right) continues to reflect individual swipe status unless specified otherwise.

### Rationale
- Matches standard dating app behavior (e.g., Tinder): unmatching is permanent and prevents the unmatched user from reappearing in the swipe card queue.
- Zero extra schema complexity needed.

---

## 5. Summary of Architecture Decisions

| Component | Technical Decision | Key Benefit |
| :--- | :--- | :--- |
| **Discovery Deck** | PostgreSQL `WHERE NOT EXISTS` Anti-Join | Fast, sub-100ms candidate queue, automatically skips already-swiped users |
| **Gender Filter** | Opposite-sex filter (`UPPER(gender) = UPPER(opposite)`) | 100% adherence to dating orientation rule |
| **Match Concurrency** | Canonical UUID ordering `user1Id < user2Id` + `upsert` | Zero deadlocks, exactly one match record per pair |
| **Clean Architecture** | Repositories in `src/core/abstracts/`, pure TS use case tests | Full compliance with VibeU backend constitution |
| **Response Format** | Global NestJS Envelope Pattern | Consistent API contract across all endpoints |
