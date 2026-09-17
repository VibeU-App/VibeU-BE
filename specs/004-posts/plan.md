# Implementation Plan: Post & Feed Management (Posting Domain)

**Branch**: `13-09-spec` (`004-posts`) | **Date**: 2026-09-13 | **Spec**: [spec.md](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/spec.md)

**Input**: Feature specification from `/specs/004-posts/spec.md` ("I intend to create the posting feature. There will have 2 flows: posting and feeds. I need a spec that is aligned with the option postgresql for everything. Feeds fetch from matched (both swipe right), then swiped (user swiped right), finally strangers.")

---

## Summary

Implement the Posting and Feeds Domain for VibeU backend, organized into two distinct flows:
1. **Posting Flow**: Create posts (text up to 2000 chars, media URLs up to 5 images), toggle pin status (enforcing max 1 pinned post per author profile via atomic PostgreSQL transactions), soft-delete posts, toggle likes, and add comments.
2. **Feeds Flow**: Retrieve Discovery/Timeline Feed prioritized by a **3-tier social relationship hierarchy** and User Profile Feed (pinned post first, then chronological) using **PostgreSQL for everything**:
   - **Tier 1 (Matched Users)**: Authors where a mutual right-swipe match exists with the viewer.
   - **Tier 2 (Swiped-Right Users)**: Authors whom the viewer swiped right on (pending match).
   - **Tier 3 (Strangers)**: All other campus users not swiped right on.
   - Keyset cursor pagination encoding `(tier, createdAt, id)` for deterministic infinite scroll across tier boundaries with zero duplicates and sub-100ms query performance without external caching systems (no Redis fan-out or secondary search engines).

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 20+

**Primary Dependencies**: NestJS 11, Prisma Client 7.8, class-validator, class-transformer

**Storage**: PostgreSQL (via Prisma ORM) — All storage, feeds, keyset pagination, social tiering, and atomic counters run directly on PostgreSQL

**Testing**: Jest (pure TypeScript testing for Use Cases; supertest for integration/E2E)

**Target Platform**: Docker (Linux ARM64/AMD64) / Node.js Alpine

**Project Type**: web-service (NestJS REST API)

**Performance Goals**:
- Post creation under 200ms
- Timeline 3-tier feed queries (20 posts with author metadata, relation badge, and like status) under 100ms
- Profile feed queries under 75ms
- Pin/unpin and like toggles under 50ms

**Constraints**:
- Follow VibeU Constitution (Flat Clean Architecture): strict separation between `core` (entities/abstracts), `use-cases`, `infrastructure` (Prisma/DB), and `controllers`.
- Single pinned post per user profile enforced atomically via `prisma.$transaction`.
- 3-tier keyset cursor pagination encoding `(tier, createdAt, id)` in opaque base64 for reliable infinite scroll without duplicate entries.
- Response payloads wrapped in the standard VibeU response envelope.

---

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- **Flat Clean Architecture Compliance**: Yes.
  - Domain Layer (`src/core/entities/`, `src/core/abstracts/`): pure business entities (`PostEntity`, `CommentEntity`, `PostLikeEntity`) and abstract repository tokens (`IPostRepository`, `ICommentRepository`, `IPostLikeRepository`, `ISocialRelationRepository`).
  - Application Layer (`src/use-cases/post/`): pure use-case classes programming strictly against repository interfaces.
  - Infrastructure Layer (`src/infrastructure/frameworks/database/`): Prisma models (`Post`, `Comment`, `PostLike`, `Swipe`, `Match`), concrete repository implementations (`PrismaPostRepository`, `PrismaCommentRepository`, `PrismaPostLikeRepository`, `PrismaSocialRelationRepository`).
  - Presentation Layer (`src/controllers/post.controller.ts`, `src/controllers/dto/post/`): REST endpoints, DTOs, and validation pipes.
- **The Dependency & Repository Rule**: Yes. Use-case services inject repository contracts using interface tokens (e.g. `@Inject('IPostRepository')`).
- **Envelope Pattern Compliance**: Yes. Controller handlers return plain data DTOs, wrapped globally in the standard VibeU envelope (`metadata`, `data`, `statusCode`, `message`) via `TransformInterceptor`.
- **Repository Mocking in Unit Tests**: Yes. Unit tests mock repository contracts in-memory without database dependencies or `@nestjs/testing`.
- **Validation**: Yes. All incoming requests validated via `class-validator` DTOs with `ValidationPipe`.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-posts/
├── plan.md              # Implementation plan (this file)
├── research.md          # Decisions: PostgreSQL for everything, 3-tier relationship feed, keyset pagination
├── data-model.md        # Prisma models, domain entities, repository contracts & 3-tier cursor types
├── quickstart.md        # Migration setup and verification scenarios for Posting & 3-Tier Feeds
├── contracts/
│   └── endpoints.md     # REST API JSON contracts following VibeU Envelope pattern
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                                     # Add Post, Comment, PostLike, Swipe, and Match models + indexes

src/
├── core/
│   ├── entities/
│   │   ├── post.entity.ts                            # Domain Post entity (with AuthorRelation)
│   │   ├── comment.entity.ts                         # Domain Comment entity
│   │   └── post-like.entity.ts                       # Domain PostLike entity
│   ├── abstracts/
│   │   ├── post-repository.abstract.ts               # Abstract IPostRepository (timeline & profile feeds)
│   │   ├── comment-repository.abstract.ts            # Abstract ICommentRepository
│   │   ├── post-like-repository.abstract.ts          # Abstract IPostLikeRepository
│   │   └── social-relation-repository.abstract.ts    # Abstract ISocialRelationRepository (matches & swipes)
│   └── types/
│       └── feed.types.ts                             # KeysetCursor (tier, createdAt, id), FeedResult, ProfileFeedResult
│
├── use-cases/
│   └── post/
│       ├── create-post.usecase.ts                    # Flow 1: Create post with text/media
│       ├── pin-post.usecase.ts                       # Flow 1: Pin/unpin post (atomic swap)
│       ├── delete-post.usecase.ts                    # Flow 1: Soft-delete post
│       ├── toggle-like.usecase.ts                    # Flow 1: Like/unlike post with atomic counter
│       ├── create-comment.usecase.ts                 # Flow 1: Add comment with atomic counter
│       ├── get-timeline-feed.usecase.ts              # Flow 2: 3-Tier Community timeline feed (keyset)
│       ├── get-profile-feed.usecase.ts               # Flow 2: User profile feed (pinned first)
│       ├── get-post-detail.usecase.ts                # Flow 2: Single post detail view
│       └── get-comments.usecase.ts                   # Flow 2: List comments (chronological)
│
├── infrastructure/
│   └── frameworks/
│       └── database/
│           ├── prisma-post.repository.ts             # Concrete Prisma IPostRepository implementation
│           ├── prisma-comment.repository.ts          # Concrete Prisma ICommentRepository implementation
│           ├── prisma-post-like.repository.ts        # Concrete Prisma IPostLikeRepository implementation
│           └── prisma-social-relation.repository.ts  # Concrete Prisma ISocialRelationRepository implementation
│
└── controllers/
    ├── post.controller.ts                            # HTTP endpoints for /api/v1/posts
    ├── post.module.ts                                # NestJS module registering controllers & providers
    └── dto/
        └── post/
            ├── create-post.dto.ts                    # DTO: Create post
            ├── pin-post.dto.ts                       # DTO: Pin post
            ├── create-comment.dto.ts                 # DTO: Create comment
            ├── timeline-feed-query.dto.ts            # DTO: Keyset cursor & limit query params
            └── profile-feed-query.dto.ts             # DTO: Profile feed query params
```

**Structure Decision**: Option 1 (Single project), strictly conforming to VibeU's Flat Clean Architecture.

---

## Complexity Tracking

*No constitution violations.* All design choices adhere directly to the project's Flat Clean Architecture and the user's architectural directive of using PostgreSQL natively for all feed and social relationship operations.
