# Data Model: Profile Swiping & Matching (Swiping Domain)

**Feature**: `005-swiping`  
**Date**: 2026-09-13  
**Status**: Complete  

---

## 1. Prisma Schema Additions

The Swiping and Matching domain adds two core relational tables to `prisma/schema.prisma`.

```prisma
// Swipe model - records swiping decisions (LIKE or PASS)
model Swipe {
  id        String   @id @default(uuid())
  swiperId  String   @map("swiper_id")
  targetId  String   @map("target_id")
  isLike    Boolean  @default(true) @map("is_like")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  swiper User @relation("SwiperUser", fields: [swiperId], references: [id], onDelete: Cascade)
  target User @relation("TargetUser", fields: [targetId], references: [id], onDelete: Cascade)

  // Composite unique constraint: exactly 1 swipe per swiper-target pair
  @@unique([swiperId, targetId])
  @@index([swiperId, isLike])
  @@index([targetId, isLike])
  @@map("swipes")
}

// Match model - records mutual right-swipe connections
model Match {
  id        String   @id @default(uuid())
  user1Id   String   @map("user1_id")
  user2Id   String   @map("user2_id")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user1 User @relation("MatchUser1", fields: [user1Id], references: [id], onDelete: Cascade)
  user2 User @relation("MatchUser2", fields: [user2Id], references: [id], onDelete: Cascade)

  // Canonical ordering constraint: user1Id < user2Id ensures exactly 1 match row per pair
  @@unique([user1Id, user2Id])
  @@index([user1Id])
  @@index([user2Id])
  @@map("matches")
}
```

### Relations on the Existing `User` Model
```prisma
model User {
  // ... existing fields ...

  // Swiping relations
  swipesSent     Swipe[] @relation("SwiperUser")
  swipesReceived Swipe[] @relation("TargetUser")
  matchesAsUser1 Match[] @relation("MatchUser1")
  matchesAsUser2 Match[] @relation("MatchUser2")
}
```

---

## 2. Domain Entities (`src/core/entities/`)

### `SwipeEntity` (`src/core/entities/swipe.entity.ts`)
```typescript
export class SwipeEntity {
  id: string;
  swiperId: string;
  targetId: string;
  isLike: boolean;
  createdAt: Date;
}
```

### `MatchEntity` (`src/core/entities/match.entity.ts`)
```typescript
export class MatchEntity {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;

  // Joined/Populated user profile for presentation
  matchedUser?: {
    userId: string;
    nickname: string;
    avatarSeed: string;
    university: string | null;
    archetypeName: string | null;
  };
}
```

### `CandidateCardEntity` (`src/core/entities/candidate-card.entity.ts`)
```typescript
export class CandidateCardEntity {
  userId: string;
  nickname: string;
  gender: string; // Strictly opposite of viewer's gender
  birthday: Date;
  age: number;
  university: string | null;
  bio: string | null;
  avatarSeed: string;
  photos: string[];
  hobbies: string[];
  personalityArchetype: {
    id: number;
    name: string;
    imageUrl: string | null;
  } | null;
}
```

---

## 3. Repository Interfaces / Ports (`src/core/abstracts/`)

### `ISwipeRepository` (`src/core/abstracts/swipe-repository.interface.ts`)
```typescript
import { SwipeEntity } from '../entities/swipe.entity';
import { CandidateCardEntity } from '../entities/candidate-card.entity';

export interface ISwipeRepository {
  create(swipe: {
    swiperId: string;
    targetId: string;
    isLike: boolean;
  }): Promise<SwipeEntity>;

  findBySwiperAndTarget(
    swiperId: string;
    targetId: string,
  ): Promise<SwipeEntity | null>;

  findReciprocalLike(
    swiperId: string;
    targetId: string,
  ): Promise<SwipeEntity | null>;

  findDeckCandidates(
    viewerUserId: string;
    oppositeGender: string;
    limit: number,
  ): Promise<CandidateCardEntity[]>;
}
```

### `IMatchRepository` (`src/core/abstracts/match-repository.interface.ts`)
```typescript
import { MatchEntity } from '../entities/match.entity';

export interface IMatchRepository {
  createMatch(user1Id: string, user2Id: string): Promise<MatchEntity>;

  findById(matchId: string): Promise<MatchEntity | null>;

  findMatchBetween(userA: string, userB: string): Promise<MatchEntity | null>;

  findAllByUserId(userId: string): Promise<MatchEntity[]>;

  deleteMatch(matchId: string): Promise<boolean>;
}
```

---

## 4. State Transitions & Invariants

```
               [Candidate Discovery]
                        │
                        ▼
            ┌───────────────────────┐
            │ Candidate Card Deck   │ (Opposite sex only, no prior swipes)
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼ (Swipe Left / PASS)           ▼ (Swipe Right / LIKE)
 ┌─────────────┐                 ┌─────────────┐
 │ Swipe (PASS)│                 │ Swipe (LIKE)│
 └─────────────┘                 └──────┬──────┘
                                        │
                         Reciprocal LIKE exists?
                                        │
                         ┌──────────────┴──────────────┐
                         ▼ No                          ▼ Yes
                  ┌─────────────┐               ┌─────────────┐
                  │ isMatch:    │               │ isMatch:    │
                  │   false     │               │   true      │
                  └─────────────┘               └──────┬──────┘
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │    Match    │
                                                │   Created   │
                                                └──────┬──────┘
                                                       │
                                            (User initiates Unmatch)
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │ Match Record│
                                                │   Deleted   │
                                                └─────────────┘
                                           (Swipes remain preserved:
                                            cannot re-swipe/re-appear)
```

### Domain Invariants:
1. **Opposite-Sex Invariant**: `UPPER(viewer.gender) != UPPER(candidate.gender)`. Enforced at both Discovery Deck query time and direct Swipe submission time.
2. **Self-Swipe Invariant**: `swiperId != targetId`.
3. **Single Interaction Invariant**: `(swiperId, targetId)` is unique in `swipes`. Attempting a second swipe throws HTTP 409 Conflict.
4. **Canonical Match Ordering**: For every `Match`, `user1Id < user2Id`.
5. **Permanent Unmatch Invariant**: Unmatching deletes the `Match` row, but preserves `Swipe` rows, ensuring neither user ever reappears in the other's swipe deck.
