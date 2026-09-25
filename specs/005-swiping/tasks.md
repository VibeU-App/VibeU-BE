# Tasks: Profile Swiping & Matching (Swiping Domain)

**Input**: Design documents from `specs/005-swiping/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/endpoints.md`, `quickstart.md`)  
**Branch**: `13-09-spec`  
**Constitution Alignment**: Flat Clean Architecture, Repository Pattern, Envelope Response Pattern, Pure TypeScript use case testing (no `@nestjs/testing`).

---

## Phase 1: Setup & Module Scaffolding

**Purpose**: Initialize directory structure and module wiring for the Swiping domain.

- [ ] T001 Create swiping use-cases directory structure at `src/use-cases/swiping/`
- [ ] T002 [P] Create swiping DTO directory structure at `src/controllers/dtos/swipe/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, domain entities, and repository interfaces that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Add `Swipe` and `Match` models and relations to `prisma/schema.prisma` per `specs/005-swiping/data-model.md`
- [ ] T004 Run Prisma migration and CJS fix script via `pnpm generate` to update Prisma Client
- [ ] T005 [P] Create `SwipeEntity` domain model in `src/core/entities/swipe.entity.ts`
- [ ] T006 [P] Create `MatchEntity` domain model in `src/core/entities/match.entity.ts`
- [ ] T007 [P] Create `CandidateCardEntity` domain model in `src/core/entities/candidate-card.entity.ts`
- [ ] T008 Export new entities from `src/core/entities/index.ts`
- [ ] T009 [P] Define `ISwipeRepository` interface in `src/core/abstracts/swipe-repository.interface.ts`
- [ ] T010 [P] Define `IMatchRepository` interface in `src/core/abstracts/match-repository.interface.ts`
- [ ] T011 Export new repository interfaces from `src/core/abstracts/index.ts`
- [ ] T012 Implement `PrismaSwipeRepository` in `src/infrastructure/frameworks/database/swipe.repository.ts`
- [ ] T013 Implement `PrismaMatchRepository` with canonical ordering in `src/infrastructure/frameworks/database/match.repository.ts`
- [ ] T014 Register and export `ISwipeRepository` and `IMatchRepository` providers in `src/infrastructure/frameworks/database/database.module.ts`

**Checkpoint**: Foundation ready — database schema, domain models, and repository ports are complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Swiping on Profile Cards (Priority: P1) 🎯 MVP

**Goal**: Allow authenticated users to submit a swipe decision (`LIKE` or `PASS`) on a candidate profile card, enforcing self-swipe prevention, duplicate swipe rejection, and opposite-sex compatibility.

**Independent Test**: Load candidate profile, submit a right swipe (Like) or left swipe (Pass), verify swipe record is persisted and duplicate/self/same-sex swipes are rejected with proper status codes.

### Tests for User Story 1
- [ ] T015 [P] [US1] Create pure TypeScript unit tests for `CreateSwipeUseCase` in `src/use-cases/swiping/create-swipe.use-case.spec.ts` (testing self-swipe validation, opposite-sex validation, duplicate swipe conflict, and swipe creation)

### Implementation for User Story 1
- [ ] T016 [P] [US1] Create `CreateSwipeDto` with validation decorators in `src/controllers/dtos/swipe/create-swipe.dto.ts`
- [ ] T017 [US1] Implement `CreateSwipeUseCase` in `src/use-cases/swiping/create-swipe.use-case.ts` (injecting `ISwipeRepository`, `IProfileRepository`, and `IUserRepository`)
- [ ] T018 [US1] Implement `SwipeController` with `POST /api/v1/swipes` endpoint in `src/controllers/swipe.controller.ts`
- [ ] T019 [US1] Create `SwipeModule` in `src/controllers/swipe.module.ts` and register it in `src/app.module.ts`

**Checkpoint**: User Story 1 is functional — users can record likes and passes with full validation and envelope response formatting.

---

## Phase 4: User Story 2 - Instant Mutual Match Detection (Priority: P1)

**Goal**: Automatically detect reciprocal likes when a user swipes right, create a `Match` record using canonical ordering (`user1Id < user2Id`) within an atomic transaction, and return `isMatch: true` with matched user profile summary.

**Independent Test**: User A swipes right on User B, User B swipes right on User A; verify User B receives `isMatch: true` with User A's nickname and avatar, and exactly one match row is created in `matches`.

### Tests for User Story 2
- [ ] T020 [P] [US2] Add unit test cases in `src/use-cases/swiping/create-swipe.use-case.spec.ts` for reciprocal like detection, canonical user ID ordering (`user1Id < user2Id`), and mutual match formation

### Implementation for User Story 2
- [ ] T021 [US2] Update `CreateSwipeUseCase` in `src/use-cases/swiping/create-swipe.use-case.ts` to query `findReciprocalLike` and invoke `IMatchRepository.createMatch` upon mutual like
- [ ] T022 [US2] Ensure atomic match creation and profile hydration in `PrismaSwipeRepository` and `PrismaMatchRepository` in `src/infrastructure/frameworks/database/`

**Checkpoint**: User Stories 1 AND 2 work seamlessly — swiping right on someone who liked you immediately triggers a mutual match.

---

## Phase 5: User Story 3 - Candidate Discovery Card Deck with Opposite-Sex Filtering (Priority: P1)

**Goal**: Provide a candidate discovery endpoint (`GET /api/v1/swipes/deck`) returning a batch of up to 15 eligible profiles strictly filtered to the opposite sex, excluding the viewer, uncompleted profiles, and previously swiped profiles.

**Independent Test**: Request candidate deck as a female user (verify 100% of returned profiles are male), request candidate deck as a male user (verify 100% of returned profiles are female), verify already-swiped users never reappear.

### Tests for User Story 3
- [ ] T023 [P] [US3] Create pure TypeScript unit tests for `GetSwipeDeckUseCase` in `src/use-cases/swiping/get-swipe-deck.use-case.spec.ts` (verifying opposite-sex target determination, query limit defaults, and candidate deck transformation)

### Implementation for User Story 3
- [ ] T024 [P] [US3] Create `GetSwipeDeckQueryDto` with pagination/limit validation in `src/controllers/dtos/swipe/get-swipe-deck-query.dto.ts`
- [ ] T025 [US3] Implement `findDeckCandidates` query with PostgreSQL `WHERE NOT EXISTS` anti-join in `src/infrastructure/frameworks/database/swipe.repository.ts`
- [ ] T026 [US3] Implement `GetSwipeDeckUseCase` in `src/use-cases/swiping/get-swipe-deck.use-case.ts` (resolving viewer gender, calculating opposite sex, and fetching candidate deck)
- [ ] T027 [US3] Add `GET /api/v1/swipes/deck` endpoint to `SwipeController` in `src/controllers/swipe.controller.ts`

**Checkpoint**: All P1 user stories complete — users can discover opposite-sex candidates, swipe on them, and get matched.

---

## Phase 6: User Story 4 - Viewing & Managing Matches (Priority: P2)

**Goal**: Allow authenticated users to view all their current mutual matches in chronological order (`GET /api/v1/swipes/matches`) and unmatch connections (`DELETE /api/v1/swipes/matches/:matchId`), preserving swipe records so unlinked users never reappear in swipe decks.

**Independent Test**: Retrieve matches list after forming a match, confirm matched user details appear; execute unmatch, confirm match is removed and neither user appears in the other's matches or swipe deck.

### Tests for User Story 4
- [ ] T028 [P] [US4] Create pure TypeScript unit tests for `GetMatchesUseCase` in `src/use-cases/swiping/get-matches.use-case.spec.ts`
- [ ] T029 [P] [US4] Create pure TypeScript unit tests for `UnmatchUseCase` in `src/use-cases/swiping/unmatch.use-case.spec.ts` (verifying authorization, deletion, and swipe preservation)

### Implementation for User Story 4
- [ ] T030 [P] [US4] Create `MatchParamDto` with UUID validation in `src/controllers/dtos/swipe/match-param.dto.ts`
- [ ] T031 [US4] Implement `findAllByUserId` in `src/infrastructure/frameworks/database/match.repository.ts`
- [ ] T032 [US4] Implement `deleteMatch` in `src/infrastructure/frameworks/database/match.repository.ts`
- [ ] T033 [US4] Implement `GetMatchesUseCase` in `src/use-cases/swiping/get-matches.use-case.ts`
- [ ] T034 [US4] Implement `UnmatchUseCase` in `src/use-cases/swiping/unmatch.use-case.ts`
- [ ] T035 [US4] Add `GET /api/v1/swipes/matches` and `DELETE /api/v1/swipes/matches/:matchId` endpoints to `SwipeController` in `src/controllers/swipe.controller.ts`

**Checkpoint**: All user stories complete — full swiping and matching lifecycle is functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Clean architecture barrel exports, full test suite validation, build check, and quickstart verification.

- [ ] T036 Export all swiping use cases from `src/use-cases/swiping/index.ts` and `src/use-cases/index.ts`
- [ ] T037 Run all pure TypeScript unit tests via `pnpm test` to verify zero test regressions
- [ ] T038 Validate full application compilation via `pnpm build`
- [ ] T039 Execute quickstart validation scenarios per `specs/005-swiping/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**.
- **User Story 1 & 2 (Phase 3 & 4)**: Depend on Phase 2; deliver swipe registration and mutual match detection.
- **User Story 3 (Phase 5)**: Depends on Phase 2; can be implemented in parallel with US1/US2 or sequentially.
- **User Story 4 (Phase 6)**: Depends on Phase 2 (and benefits from US2 match creation).
- **Polish (Phase 7)**: Depends on all user story phases being complete.

### User Story Dependencies
```
Phase 2: Foundational (Schema, Entities, Repositories)
       │
       ├──► Phase 3: US1 - Swipe Decisions (P1)
       │         │
       │         ▼
       │    Phase 4: US2 - Instant Mutual Match (P1)
       │         │
       ├──► Phase 5: US3 - Opposite-Sex Candidate Deck (P1)
       │         │
       └──► Phase 6: US4 - Matches List & Unmatching (P2)
                 │
                 ▼
       Phase 7: Polish & Verification
```

---

## Parallel Opportunities

### Parallel Within Phase 2 (Foundational)
- Entities: `SwipeEntity` (T005), `MatchEntity` (T006), `CandidateCardEntity` (T007)
- Interfaces: `ISwipeRepository` (T009), `IMatchRepository` (T010)

### Parallel Within User Stories
- **US1**: `CreateSwipeDto` (T016) and `create-swipe.use-case.spec.ts` (T015) can be created in parallel.
- **US3**: `GetSwipeDeckQueryDto` (T024) and `get-swipe-deck.use-case.spec.ts` (T023) can be created in parallel.
- **US4**: `MatchParamDto` (T030), `get-matches.use-case.spec.ts` (T028), and `unmatch.use-case.spec.ts` (T029) can run in parallel.

---

## Implementation Strategy

### MVP First (Phases 1, 2, 3, 4)
1. Complete Setup + Foundational (Prisma schema, entities, repositories).
2. Complete US1 & US2 (Swiping + Instant Mutual Match).
3. Complete US3 (Candidate deck with opposite-sex filter).
4. **STOP and VALIDATE**: Run `quickstart.md` scenarios 1, 2, 3, and 4.

### Incremental Delivery
- Increment 1: Foundational schema & entities.
- Increment 2: Candidate deck with strict opposite-sex filtering (US3).
- Increment 3: Swipe recording & instant mutual match detection (US1 & US2).
- Increment 4: Match list and unmatching (US4).
- Increment 5: End-to-end integration and polish.
