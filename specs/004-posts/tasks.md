# Tasks: Post & Comment Management (Posting Domain)

**Input**: Design documents from `/specs/004-posts/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/endpoints.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Exact file paths included in task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify branch setup and directory infrastructure

- [ ] T001 Verify git branch `004-posts` and feature specification directory `specs/004-posts/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema, domain entities, repository abstractions, and database implementations required before implementing any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Add `Post` and `Comment` models with relations, indexes, and soft-delete fields to `prisma/schema.prisma`
- [ ] T003 Generate Prisma Client using `npx prisma generate`
- [ ] T004 [P] Create `PostEntity` domain model in `src/core/entities/post.entity.ts`
- [ ] T005 [P] Create `CommentEntity` domain model in `src/core/entities/comment.entity.ts`
- [ ] T006 [P] Create `IPostRepository` abstract contract in `src/core/abstracts/post-repository.abstract.ts`
- [ ] T007 [P] Create `ICommentRepository` abstract contract in `src/core/abstracts/comment-repository.abstract.ts`
- [ ] T008 Implement `PrismaPostRepository` in `src/infrastructure/frameworks/database/prisma-post.repository.ts`
- [ ] T009 Implement `PrismaCommentRepository` in `src/infrastructure/frameworks/database/prisma-comment.repository.ts`
- [ ] T010 Register repository providers (`IPostRepository`, `ICommentRepository`) in `src/infrastructure/frameworks/database/database.module.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Post Creation with Text & Images (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create posts containing text content, image attachments (max 5), or both.

**Independent Test**: Send `POST /api/v1/posts` request with text and media payload, verifying post creation and database persistence.

- [ ] T011 [P] [US1] Create `CreatePostDto` validation class in `src/controllers/dto/create-post.dto.ts`
- [ ] T012 [P] [US1] Implement `CreatePostUseCase` in `src/use-cases/post/create-post.usecase.ts`
- [ ] T013 [US1] Add unit tests for `CreatePostUseCase` in `src/use-cases/post/create-post.usecase.spec.ts`
- [ ] T014 [US1] Implement `POST /api/v1/posts` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: User Story 1 complete and independently testable (MVP reached!)

---

## Phase 4: User Story 2 - Pinning & Unpinning Posts (Priority: P1)

**Goal**: Users can pin a specific post to the top of their profile feed (max 1 active pinned post per user).

**Independent Test**: Send `PATCH /api/v1/posts/:id/pin` with `{ "isPinned": true }` and confirm post is pinned while any previous pinned post is unpinned.

- [ ] T015 [P] [US2] Create `PinPostDto` validation class in `src/controllers/dto/pin-post.dto.ts`
- [ ] T016 [P] [US2] Implement `PinPostUseCase` in `src/use-cases/post/pin-post.usecase.ts`
- [ ] T017 [US2] Add unit tests for `PinPostUseCase` in `src/use-cases/post/pin-post.usecase.spec.ts`
- [ ] T018 [US2] Implement `PATCH /api/v1/posts/:id/pin` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 5: User Story 3 - Deleting Posts (Priority: P1)

**Goal**: Users can delete their own posts via soft-deletion.

**Independent Test**: Send `DELETE /api/v1/posts/:id` and confirm post is marked deleted (`deletedAt`) and excluded from feed queries.

- [ ] T019 [P] [US3] Implement `DeletePostUseCase` in `src/use-cases/post/delete-post.usecase.ts`
- [ ] T020 [US3] Add unit tests for `DeletePostUseCase` in `src/use-cases/post/delete-post.usecase.spec.ts`
- [ ] T021 [US3] Implement `DELETE /api/v1/posts/:id` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: All P1 User Stories (1, 2, 3) complete and testable

---

## Phase 6: User Story 4 - Feed & Post Detail Viewing (Priority: P2)

**Goal**: Users can view profile feeds sorted with pinned posts first, followed by unpinned posts in descending chronological order, along with author metadata and engagement counts.

**Independent Test**: Send `GET /api/v1/posts/feed` and verify post list structure, sorting, and author details.

- [ ] T022 [P] [US4] Implement `GetFeedUseCase` in `src/use-cases/post/get-feed.usecase.ts`
- [ ] T023 [US4] Add unit tests for `GetFeedUseCase` in `src/use-cases/post/get-feed.usecase.spec.ts`
- [ ] T024 [US4] Implement `GET /api/v1/posts/feed` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: Profile feed viewing complete

---

## Phase 7: User Story 5 - Post Commenting (Priority: P2)

**Goal**: Users can add comments to posts and view post comments in chronological order.

**Independent Test**: Send `POST /api/v1/posts/:id/comments` and `GET /api/v1/posts/:id/comments`, verifying comment display and `commentCount` increment on parent post.

- [ ] T025 [P] [US5] Create `CreateCommentDto` validation class in `src/controllers/dto/create-comment.dto.ts`
- [ ] T026 [P] [US5] Implement `CreateCommentUseCase` in `src/use-cases/post/create-comment.usecase.ts`
- [ ] T027 [P] [US5] Implement `GetCommentsUseCase` in `src/use-cases/post/get-comments.usecase.ts`
- [ ] T028 [US5] Add unit tests for comment use cases in `src/use-cases/post/comment.usecases.spec.ts`
- [ ] T029 [US5] Implement `POST /api/v1/posts/:id/comments` and `GET /api/v1/posts/:id/comments` endpoint handlers in `src/controllers/post.controller.ts`

**Checkpoint**: All user stories functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Framework wiring, end-to-end unit test suite verification, and quickstart validation

- [ ] T030 Wire `PostController` into NestJS controller module in `src/infrastructure/controllers/controllers.module.ts`
- [ ] T031 Run all post unit tests via `npm run test -- src/use-cases/post/`
- [ ] T032 Verify quickstart guide scenarios in `specs/004-posts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion.
  - User Stories can proceed sequentially in priority order: US1 (P1) → US2 (P1) → US3 (P1) → US4 (P2) → US5 (P2).
- **Polish (Phase 8)**: Depends on completion of all user story phases.

### Parallel Opportunities

- Foundational entity/abstract tasks (T004, T005, T006, T007) can run in parallel.
- DTOs and Use-Case classes marked `[P]` within each phase can be developed in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (Schema, Entities, Repositories).
3. Complete Phase 3: User Story 1 (Create Post).
4. **STOP and VALIDATE**: Test post creation independently.

### Incremental Delivery

1. Foundation → DB schema ready.
2. User Story 1 → Create Post (MVP!).
3. User Story 2 → Pin / Unpin Post.
4. User Story 3 → Delete Post.
5. User Story 4 → Feed Viewing.
6. User Story 5 → Post Commenting.
