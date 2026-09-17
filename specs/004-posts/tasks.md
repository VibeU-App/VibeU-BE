# Tasks: Post & Feed Management (Posting Domain)

**Input**: Design documents from `/specs/004-posts/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/endpoints.md`, `quickstart.md`)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/endpoints.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6, US7)
- Exact file paths included in task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify branch setup and directory infrastructure

- [X] T001 Verify git branch `13-09-spec` (`004-posts`) and feature specification directory `specs/004-posts/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Prisma schema models, domain entities, repository abstractions, keyset types, and database implementations required before implementing any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `Post`, `Comment`, `PostLike`, `Swipe`, and `Match` models with compound indexes and relations in `prisma/schema.prisma`
- [X] T003 Generate Prisma Client and apply migrations framework using `pnpm prisma generate && node scripts/fix-prisma-cjs.js`
- [X] T004 [P] Create `PostEntity` (with `AuthorRelation`), `CommentEntity`, and `PostLikeEntity` in `src/core/entities/post.entity.ts`, `src/core/entities/comment.entity.ts`, and `src/core/entities/post-like.entity.ts`
- [X] T005 [P] Create keyset pagination and feed result contracts (`KeysetCursor`, `FeedResult`, `ProfileFeedResult`) in `src/core/types/feed.types.ts`
- [X] T006 [P] Create `IPostRepository` abstract contract in `src/core/abstracts/post-repository.abstract.ts`
- [X] T007 [P] Create `ICommentRepository` abstract contract in `src/core/abstracts/comment-repository.abstract.ts`
- [X] T008 [P] Create `IPostLikeRepository` abstract contract in `src/core/abstracts/post-like-repository.abstract.ts`
- [X] T009 [P] Create `ISocialRelationRepository` abstract contract in `src/core/abstracts/social-relation-repository.abstract.ts`
- [X] T010 Implement `PrismaPostRepository` with 3-tier feed query and keyset seek logic in `src/infrastructure/frameworks/database/prisma-post.repository.ts`
- [X] T011 Implement `PrismaCommentRepository` in `src/infrastructure/frameworks/database/prisma-comment.repository.ts`
- [X] T012 Implement `PrismaPostLikeRepository` with atomic counter updates in `src/infrastructure/frameworks/database/prisma-post-like.repository.ts`
- [X] T013 Implement `PrismaSocialRelationRepository` fetching matches and right-swipes in `src/infrastructure/frameworks/database/prisma-social-relation.repository.ts`
- [X] T014 Register repository providers (`IPostRepository`, `ICommentRepository`, `IPostLikeRepository`, `ISocialRelationRepository`) in `src/infrastructure/frameworks/database/database.module.ts`
- [X] T015 Create `PostModule` registering controllers and use-case providers in `src/controllers/post.module.ts` and import into `src/app.module.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Post Creation with Text & Media (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can publish posts containing text content (max 2000 chars), image attachments (max 5), or both.

**Independent Test**: Send `POST /api/v1/posts` request with text and media payload, verifying post creation, validation, and database persistence.

- [X] T016 [P] [US1] Create `CreatePostDto` validation class in `src/controllers/dto/post/create-post.dto.ts`
- [X] T017 [P] [US1] Implement `CreatePostUsecase` in `src/use-cases/post/create-post.usecase.ts`
- [X] T018 [US1] Add unit tests for `CreatePostUsecase` in `src/use-cases/post/create-post.usecase.spec.ts`
- [X] T019 [US1] Implement `POST /api/v1/posts` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: User Story 1 complete and independently testable (MVP reached!)

---

## Phase 4: User Story 2 - Profile Post Pinning & Unpinning (Priority: P1)

**Goal**: Authors can pin a single post to the top of their profile feed (enforcing max 1 pinned post per profile via atomic transaction).

**Independent Test**: Send `PATCH /api/v1/posts/:id/pin` with `{ "isPinned": true }` and verify the post becomes pinned while any previously pinned post is unpinned atomically.

- [X] T020 [P] [US2] Create `PinPostDto` validation class in `src/controllers/dto/post/pin-post.dto.ts`
- [X] T021 [P] [US2] Implement `PinPostUsecase` with atomic swapping in `src/use-cases/post/pin-post.usecase.ts`
- [X] T022 [US2] Add unit tests for `PinPostUsecase` in `src/use-cases/post/pin-post.usecase.spec.ts`
- [X] T023 [US2] Implement `PATCH /api/v1/posts/:id/pin` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: User Stories 1 AND 2 functional and testable independently

---

## Phase 5: User Story 3 - Post Soft Deletion (Priority: P1)

**Goal**: Authors can soft-delete their own posts, immediately excluding them from feeds and clearing pinned status.

**Independent Test**: Send `DELETE /api/v1/posts/:id` and confirm the post is marked deleted (`deletedAt`), unpinned, and omitted from subsequent queries.

- [X] T024 [P] [US3] Implement `DeletePostUsecase` in `src/use-cases/post/delete-post.usecase.ts`
- [X] T025 [US3] Add unit tests for `DeletePostUsecase` in `src/use-cases/post/delete-post.usecase.spec.ts`
- [X] T026 [US3] Implement `DELETE /api/v1/posts/:id` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: All P1 Posting Flow stories (US1, US2, US3) complete and testable

---

## Phase 6: User Story 5 - Discovery / Timeline Feed with 3-Tier Relationship Prioritization (Priority: P1)

**Goal**: Authenticated users can retrieve a discovery timeline feed prioritized by 3 social tiers (Matched -> Swiped -> Strangers) with PostgreSQL keyset cursor pagination.

**Independent Test**: Query `GET /api/v1/posts/timeline` with test accounts having matched, swiped, and stranger relationships, validating posts arrive in Tier 1 -> Tier 2 -> Tier 3 sequence and paginating across tier boundaries.

- [X] T027 [P] [US5] Create `TimelineFeedQueryDto` in `src/controllers/dto/post/timeline-feed-query.dto.ts`
- [X] T028 [P] [US5] Implement keyset cursor encoding/decoding utilities in `src/core/utils/keyset-cursor.util.ts`
- [X] T029 [US5] Implement `GetTimelineFeedUsecase` coordinating matched/swiped user queries and feed fetch in `src/use-cases/post/get-timeline-feed.usecase.ts`
- [X] T030 [US5] Add unit tests for `GetTimelineFeedUsecase` in `src/use-cases/post/get-timeline-feed.usecase.spec.ts`
- [X] T031 [US5] Implement `GET /api/v1/posts/timeline` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: Core 3-tier Discovery Feed operational and testable end-to-end

---

## Phase 7: User Story 4 - Post Engagement & Comments (Priority: P2)

**Goal**: Users can like/unlike posts and submit comments (max 500 chars) with atomic counter synchronization.

**Independent Test**: Send `POST /api/v1/posts/:id/like` and `POST /api/v1/posts/:id/comments`, verifying like/comment persistence and atomic counter increments/decrements.

- [X] T032 [P] [US4] Create `CreateCommentDto` validation class in `src/controllers/dto/post/create-comment.dto.ts`
- [X] T033 [P] [US4] Implement `ToggleLikeUsecase` in `src/use-cases/post/toggle-like.usecase.ts`
- [X] T034 [P] [US4] Implement `CreateCommentUsecase` in `src/use-cases/post/create-comment.usecase.ts`
- [X] T035 [US4] Add unit tests for `ToggleLikeUsecase` in `src/use-cases/post/toggle-like.usecase.spec.ts`
- [X] T036 [US4] Add unit tests for `CreateCommentUsecase` in `src/use-cases/post/create-comment.usecase.spec.ts`
- [X] T037 [US4] Implement `POST /api/v1/posts/:id/like` and `POST /api/v1/posts/:id/comments` in `src/controllers/post.controller.ts`

**Checkpoint**: Post engagement and commenting complete

---

## Phase 8: User Story 6 - Profile Feed (Priority: P2)

**Goal**: Users can view a specific author's profile feed with any pinned post appearing first, followed by chronological active posts.

**Independent Test**: Send `GET /api/v1/posts/profile/:authorId` and verify the author's pinned post appears in `pinnedPost` followed by unpinned posts in chronological order.

- [X] T038 [P] [US6] Create `ProfileFeedQueryDto` in `src/controllers/dto/post/profile-feed-query.dto.ts`
- [X] T039 [P] [US6] Implement `GetProfileFeedUsecase` in `src/use-cases/post/get-profile-feed.usecase.ts`
- [X] T040 [US6] Add unit tests for `GetProfileFeedUsecase` in `src/use-cases/post/get-profile-feed.usecase.spec.ts`
- [X] T041 [US6] Implement `GET /api/v1/posts/profile/:authorId` endpoint handler in `src/controllers/post.controller.ts`

**Checkpoint**: User profile feed complete

---

## Phase 9: User Story 7 - Post Detail & Comment Feed (Priority: P3)

**Goal**: Users can view a single post's details and chronological comments thread.

**Independent Test**: Send `GET /api/v1/posts/:id` and `GET /api/v1/posts/:id/comments`, verifying complete post details and chronological comment list.

- [X] T042 [P] [US7] Implement `GetPostDetailUsecase` in `src/use-cases/post/get-post-detail.usecase.ts`
- [X] T043 [P] [US7] Implement `GetCommentsUsecase` in `src/use-cases/post/get-comments.usecase.ts`
- [X] T044 [US7] Add unit tests for `GetPostDetailUsecase` and `GetCommentsUsecase` in `src/use-cases/post/get-post-detail.usecase.spec.ts` and `src/use-cases/post/get-comments.usecase.spec.ts`
- [X] T045 [US7] Implement `GET /api/v1/posts/:id` and `GET /api/v1/posts/:id/comments` in `src/controllers/post.controller.ts`

**Checkpoint**: All user stories functional and testable independently

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Cross-cutting improvements, API documentation, and regression verification

- [X] T046 [P] Update module exports and Barrel index files in `src/core/entities/index.ts`, `src/core/abstracts/index.ts`, and `src/use-cases/index.ts`
- [X] T047 [P] Configure Swagger OpenAPI annotations and tags on `src/controllers/post.controller.ts`
- [X] T048 Run complete test suite via `pnpm test` and resolve any TypeScript/ESLint warnings
- [X] T049 Execute end-to-end verification scenarios per `specs/004-posts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 - **BLOCKS all user stories**.
- **User Stories (Phase 3 through Phase 9)**: Depend on Phase 2 completion.
  - US1 (Post Creation - P1): Can start immediately after Phase 2 (MVP).
  - US2 (Pinning - P1): Depends on US1 (requires post creation).
  - US3 (Deletion - P1): Depends on US1 (requires post creation).
  - US5 (3-Tier Timeline Feed - P1): Can start after Phase 2 (reads posts).
  - US4 (Engagement & Likes - P2): Depends on US1.
  - US6 (Profile Feed - P2): Depends on US1 and US2.
  - US7 (Detail & Comments - P3): Depends on US1 and US4.
- **Polish (Phase 10)**: Depends on all user stories being complete.

---

## Parallel Example: Foundational Phase

```bash
# Launch parallel entity and contract definitions:
Task: "T004 [P] Create PostEntity, CommentEntity, PostLikeEntity in src/core/entities/"
Task: "T005 [P] Create KeysetCursor, FeedResult, ProfileFeedResult in src/core/types/feed.types.ts"
Task: "T006 [P] Create IPostRepository in src/core/abstracts/post-repository.abstract.ts"
Task: "T007 [P] Create ICommentRepository in src/core/abstracts/comment-repository.abstract.ts"
Task: "T008 [P] Create IPostLikeRepository in src/core/abstracts/post-like-repository.abstract.ts"
Task: "T009 [P] Create ISocialRelationRepository in src/core/abstracts/social-relation-repository.abstract.ts"
```

---

## Implementation Strategy

### MVP First (Phase 1 → Phase 2 → Phase 3: User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Prisma models, entities, repository contracts)
3. Complete Phase 3: User Story 1 (Create Post)
4. **STOP and VALIDATE**: Verify post creation via `POST /api/v1/posts`

### Incremental Delivery

1. **Increment 1 (Core Posting)**: Add US2 (Pinning) and US3 (Soft Deletion).
2. **Increment 2 (Core Feeds)**: Add US5 (3-Tier Timeline Feed with Keyset pagination).
3. **Increment 3 (Engagement)**: Add US4 (Like/Unlike and Comments).
4. **Increment 4 (Profile & Details)**: Add US6 (Profile Feed) and US7 (Detail & Comment Thread).
5. **Increment 5 (Polish)**: API documentation, Swagger tags, and quickstart validation.
