# Tasks: User Profile 'Me' Management

**Input**: Design documents from `/specs/003-me/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included to verify Use Case logic through pure Jest unit tests per the Project Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Standard NestJS flat clean architecture paths as defined in plan.md:
  - Domain: `src/core/entities/` and `src/core/abstracts/`
  - Application: `src/use-cases/`
  - Infrastructure: `src/infrastructure/`
  - Presentation: `src/controllers/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure check

- [ ] T001 Create placeholder files for profile use cases under `src/use-cases/profile/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema additions, migrations, repository ports & adapters

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Update `prisma/schema.prisma` to add nullable `bio` and `university` columns on `Profile`
- [ ] T003 Run Prisma migrations using `npx prisma migrate dev --name add_profile_bio`

**Checkpoint**: Foundation ready - database models and migrations are complete.

---

## Phase 3: User Story 1 - Profile Dashboard Viewing (Priority: P1) 🎯 MVP

**Goal**: Retrieve the user's dashboard profile summary (nickname, avatar, bio, zodiac, age, vibe testing archetype, post count, match count).

**Independent Test**: Send GET to `/api/v1/profile/me` and confirm dynamic calculations (age/zodiac) and aggregated statistics return successfully.

### Tests for User Story 1
- [ ] T004 [P] [US1] Create pure Jest unit tests in `src/use-cases/profile/get-profile-me.usecase.spec.ts` mocking profile and counters retrieval

### Implementation for User Story 1
- [ ] T005 [US1] Implement core logic in `src/use-cases/profile/get-profile-me.usecase.ts` combining profile, dynamic calculations, and stats query aggregates
- [ ] T006 [US1] Create route and controller action in `src/controllers/profile.controller.ts` pointing to `GetProfileMeUseCase`

**Checkpoint**: Dashboard profile summary retrieval works end-to-end.

---

## Phase 4: User Story 2 - Profile Details Editing (Priority: P1)

**Goal**: Update biography, nickname, avatar, birthday, university, and prevent updating read-only Sex/Archetype fields.

**Independent Test**: Update fields using PATCH `/api/v1/profile/me` and confirm changes persist in the database.

### Tests for User Story 2
- [ ] T007 [P] [US2] Create pure Jest unit tests in `src/use-cases/profile/update-profile-me.usecase.spec.ts` verifying field validation, age constraint ($\ge 18$), and read-only safeguards

### Implementation for User Story 2
- [ ] T012 [US2] Implement core logic in `src/use-cases/profile/update-profile-me.usecase.ts` using `IProfileRepository`
- [ ] T013 [P] [US2] Create DTO inputs validation in `src/controllers/profile/dto/update-profile.dto.ts`
- [ ] T014 [US2] Expose update profile route in `src/controllers/profile.controller.ts`

**Checkpoint**: Profile detail updates are validated and persisted.

---

## Phase 5: User Story 3 - Interest Hobbies Updating (Priority: P1)

**Goal**: Update the user's selected profile hobbies (between 3 and 10).

**Independent Test**: Submit a new list of tag IDs (hobbies) to PUT `/api/v1/profile/me/tags` and confirm they overwrite previous hobbies.

### Tests for User Story 3
- [ ] T015 [P] [US3] Create pure Jest unit tests in `src/use-cases/profile/update-profile-tags.usecase.spec.ts` validating min 3 and max 10 hobby selection rules

### Implementation for User Story 3
- [ ] T016 [US3] Implement core logic in `src/use-cases/profile/update-profile-tags.usecase.ts` using hobby associations
- [ ] T017 [P] [US3] Create DTO for tags update in `src/controllers/profile/dto/update-tags.dto.ts`
- [ ] T018 [US3] Expose tags update route in `src/controllers/profile.controller.ts`

**Checkpoint**: Users can update their profile hobbies at any time.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: API documentation, formatting, and quickstart checks

- [ ] T019 Document Swagger annotations in `src/controllers/profile.controller.ts`
- [ ] T020 Run curl calls in `specs/003-me/quickstart.md` to verify E2E workflow success
- [ ] T021 Execute lint checks and format code (`pnpm run lint` and `pnpm run format`)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Foundational (Phases 1-2)**: Core database additions and ports must exist before use cases can compile.
- **User Story 1 (P1)**: Read dashboard summary depends on Profile schema setup.
- **User Story 2 (P1)**: Edit dashboard details.
- **User Story 3 (P1)**: Profile hobbies updating requires Profile models.
- **Polish (Phase 6)**: Executed after all routes are completed.

### Parallel Opportunities
- Unit tests (`T004`, `T007`, `T015`) can be created in parallel.
- DTO validators (`T013`, `T017`) can be prepared beforehand.

---

## Parallel Example: User Story 2
```bash
# Developer A:
Task: "T007 [P] [US2] Create pure Jest unit tests in src/use-cases/profile/update-profile-me.usecase.spec.ts"

# Developer B:
Task: "T013 [P] [US2] Create DTO inputs validation in src/controllers/profile/dto/update-profile.dto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Initialize Foundational Phase database table updates (`Profile` bio/university).
2. Implement profile fetching usecase and endpoint.
3. Validate profile display before adding updates and tags editing.
