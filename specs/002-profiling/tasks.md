# Tasks: User Profiling & AI Personality Archetype Matching

**Input**: Design documents from `/specs/002-profiling/`

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

**Purpose**: Project initialization and structure setup

- [ ] T001 Create folders and placeholder files for profiling domain under `src/core/entities/`, `src/core/abstracts/`, and `src/use-cases/profile/`
- [ ] T002 Verify Prisma CLI is working and can connect to the dev database

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema setup, migrations, and database seeding

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Update database models in `prisma/schema.prisma` to include `Profile`, `PersonalityArchetype`, `Hobby`, `ProfileHobby`, `QuestionnaireQuestion`, `QuestionnaireOption`, and `UserQuestionnaireAnswer`
- [ ] T004 Run Prisma migrations using `npx prisma migrate dev --name add_profiling_schema` to apply schema updates to database
- [ ] T005 Update the database seed script in `prisma/seed.ts` to include initial hobbies, questionnaire questions/options, and personality archetypes, then run `npx prisma db seed`
- [ ] T006 [P] Define core Domain entities in `src/core/entities/profile.entity.ts`, `src/core/entities/hobby.entity.ts`, `src/core/entities/personality-archetype.entity.ts`, and `src/core/entities/questionnaire.entity.ts`
- [ ] T007 [P] Create repository interfaces (contracts) in `src/core/abstracts/profile-repository.interface.ts`, `src/core/abstracts/hobby-repository.interface.ts`, `src/core/abstracts/personality-archetype-repository.interface.ts`, and `src/core/abstracts/questionnaire-repository.interface.ts`
- [ ] T008 [P] Define AI matching interface contract in `src/core/abstracts/ai-service.interface.ts`
- [ ] T009 Implement concrete database repositories using Prisma under `src/infrastructure/frameworks/database/` implementing core interfaces: `prisma-profile.repository.ts`, `prisma-hobby.repository.ts`, `prisma-personality-archetype.repository.ts`, and `prisma-questionnaire.repository.ts`

**Checkpoint**: Foundation ready - database models, migrations, seeds, and ports/adapters are set up.

---

## Phase 3: User Story 1 - Basic Profile Setup (Priority: P1) 🎯 MVP

**Goal**: Allow users to initialize/update basic profile details (sex, nickname, birthday, avatarSeed).

**Independent Test**: Perform an HTTP POST to `/api/v1/profile/basic` with profile payload and confirm the row is created in `profiles` table.

### Tests for User Story 1
- [ ] T010 [P] [US1] Create pure Jest unit tests in `src/use-cases/profile/save-basic-profile.usecase.spec.ts` matching basic profile saving validation constraints (uniqueness, empty inputs, future birthday rejection)

### Implementation for User Story 1
- [ ] T011 [US1] Implement core logic in `src/use-cases/profile/save-basic-profile.usecase.ts` utilizing `IProfileRepository` to create/save basic details
- [ ] T012 [P] [US1] Create class-validator DTOs for payload inputs in `src/controllers/profile/dto/save-basic-profile.dto.ts`
- [ ] T013 [US1] Build routes and controller actions in `src/controllers/profile/profile.controller.ts` pointing to `SaveBasicProfileUseCase`

**Checkpoint**: Basic details creation and verification works independently.

---

## Phase 4: User Story 2 - Interest & Hobby Selection (Priority: P1)

**Goal**: Allow users to select between 3 and 10 hobbies.

**Independent Test**: Verify via HTTP POST to `/api/v1/profile/hobbies` with list of tagIds and retrieve back to check matching.

### Tests for User Story 2
- [ ] T014 [P] [US2] Create pure Jest unit tests in `src/use-cases/profile/save-hobbies.usecase.spec.ts` asserting constraints (min 3 hobbies, max 10 hobbies, invalid hobby id rejection)

### Implementation for User Story 2
- [ ] T015 [US2] Implement core logic in `src/use-cases/profile/save-hobbies.usecase.ts` using `IHobbyRepository` and `IProfileRepository`
- [ ] T016 [P] [US2] Create input validation DTO in `src/controllers/profile/dto/save-hobbies.dto.ts`
- [ ] T017 [US2] Expose endpoints in `src/controllers/profile/profile.controller.ts` for fetching available hobbies and saving profile hobbies

**Checkpoint**: Users can search, fetch, and associate hobbies with their profile.

---

## Phase 5: User Story 3 - AI-Powered Personality Archetype Matching (Priority: P2)

**Goal**: Match users to a predefined archetype based on their questionnaire answers using Gemini API.

**Independent Test**: Submit questionnaire answers to `/api/v1/profile/questionnaire/submit`, confirm LLM selection is logged and user profile points to correct `personalityArchetypeId`.

### Tests for User Story 3
- [ ] T018 [P] [US3] Create pure Jest unit tests in `src/use-cases/profile/submit-questionnaire.usecase.spec.ts` mocking the AI service wrapper to return static classification matches

### Implementation for User Story 3
- [ ] T019 [US3] Implement Gemini API connection service in `src/infrastructure/services/gemini-ai.service.ts` implementing `IAIService` using direct fetch queries
- [ ] T020 [US3] Write core application logic in `src/use-cases/profile/submit-questionnaire.usecase.ts` to fetch user answers + hobbies, construct LLM classification prompt, call `IAIService`, and save matched `personalityArchetypeId`
- [ ] T021 [P] [US3] Create answers payload validation DTO in `src/controllers/profile/dto/submit-answers.dto.ts`
- [ ] T022 [US3] Add endpoints in `src/controllers/profile/profile.controller.ts` to get questions and submit questionnaire answers

**Checkpoint**: Complete AI matching flow works end-to-end.

---

## Phase 6: User Story 4 - Retrieve Profile Summary (Priority: P2)

**Goal**: Retrieve completed profile data showing calculated age and astrological zodiac sign.

**Independent Test**: Query GET `/api/v1/profile` and verify returned JSON returns correct calculated age and Western zodiac.

### Tests for User Story 4
- [ ] T023 [P] [US4] Create unit tests in `src/use-cases/profile/get-profile.usecase.spec.ts` validating correct age/zodiac calculations across different leap years and edge-case dates

### Implementation for User Story 4
- [ ] T024 [US4] Implement helper calculation methods for age and zodiac in `src/use-cases/profile/get-profile.usecase.ts`
- [ ] T025 [US4] Create endpoint GET `/api/v1/profile` in `src/controllers/profile/profile.controller.ts` to fetch user profile details

**Checkpoint**: Dynamic values (age, zodiac) are verified and outputted in envelope payload.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integrity checks, documentation, and cleanups

- [ ] T026 Update Swagger/OpenAPI documentation annotations in `src/controllers/profile.controller.ts`
- [ ] T027 Verify error interceptors globally format profiling exceptions correctly
- [ ] T028 Run end-to-end curls documented in `specs/002-profiling/quickstart.md` to verify system integrity
- [ ] T029 Execute full backend lint check and format (`pnpm run lint` and `pnpm run format`)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Foundational (Phases 1-2)**: Prerequisite for all coding tasks.
- **User Story 1 (P1)**: Foundation for profiles. Hobbies and questionnaire tasks depend on User Story 1's models and tables containing valid data.
- **User Story 2 (P1) & User Story 3 (P2)**: Depend on basic profile details existence. Can be developed concurrently once User Story 1 endpoints are defined.
- **User Story 4 (P2)**: Relies on profile models, age/zodiac helper formulas.
- **Polish (Phase 7)**: Executed after all functionality is built.

### Parallel Opportunities
- Foundational domain interfaces (`T006`, `T007`, `T008`) can be designed concurrently.
- Unit tests (`T010`, `T014`, `T018`, `T023`) can be written before/during implementation.
- Controller DTOs (`T012`, `T016`, `T021`) can be prepared independently.

---

## Parallel Example: User Story 1
```bash
# Developer A:
Task: "T010 [P] [US1] Create pure Jest unit tests in src/use-cases/profile/save-basic-profile.usecase.spec.ts"

# Developer B:
Task: "T012 [P] [US1] Create class-validator DTOs for payload inputs in src/controllers/profile/dto/save-basic-profile.dto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Initialize Phase 1 & 2 schema updates and migrations.
2. Complete `SaveBasicProfileUseCase` and its routes.
3. Validate basic profile setup via HTTP endpoints before coding hobbies or AI integrations.

### Incremental Delivery
1. Set up profile tables and save basic details.
2. Add hobbies selection.
3. Integrate Gemini AI model matching.
4. Add retrieval endpoint with calculated age/zodiac.
5. Polish Swagger, lint, and run E2E curls.
