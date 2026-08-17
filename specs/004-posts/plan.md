# Implementation Plan: Post & Comment Management (Posting Domain)

**Branch**: `004-posts` | **Date**: 2026-08-17 | **Spec**: [spec.md](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/004-posts/spec.md)

**Input**: Feature specification from `/specs/004-posts/spec.md`

## Summary

Implement the Posting Domain for VibeU backend. This feature enables authenticated users to create text and image posts (up to 5 images), pin/unpin posts on their user profile, soft-delete posts, retrieve profile feeds sorted with pinned posts first, and create/view post comments with aggregate engagement metrics.

## Technical Context

**Language/Version**: TypeScript / Node.js 24+

**Primary Dependencies**: NestJS 11, Prisma Client 7.8, class-validator, class-transformer

**Storage**: PostgreSQL (via Prisma ORM)

**Testing**: Jest (pure TypeScript testing for Use Cases; supertest for integration/E2E)

**Target Platform**: Node.js runtime / PostgreSQL

**Project Type**: web-service (NestJS REST API)

**Performance Goals**:
- Post creation under 200ms.
- Feed query (20 posts with author info and counts) under 100ms.
- Post pin/unpin status update under 50ms.

**Constraints**:
- Follow Hexagonal Architecture: strict boundary separation between `core` (entities/abstracts), `use-cases`, `infrastructure` (Prisma/DB), and `controllers`.
- Enforce max 1 pinned post per user profile via transactional updates.
- Soft-delete posts (`deletedAt`) and auto-exclude from feed queries.
- Strict request validation using NestJS `ValidationPipe` and `class-validator`.

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- **Flat Clean Architecture Compliance**: Yes. All core domain entities (`PostEntity`, `CommentEntity`) and abstract contracts (`IPostRepository`, `ICommentRepository`) reside in `src/core/`. Application business logic resides in `src/use-cases/post/`. Database access via Prisma resides in `src/infrastructure/frameworks/database/`. Controllers reside in `src/controllers/`.
- **The Dependency & Repository Rule**: Yes. Use-case services depend strictly on abstract repository tokens (`IPostRepository`, `ICommentRepository`) injected via NestJS dependency injection.
- **Envelope Pattern Compliance**: Yes. Controller handlers return response payloads wrapped in the standard VibeU response envelope via `TransformInterceptor`.
- **Repository Mocking in Unit Tests**: Yes. Use-case unit tests mock repository interfaces in memory without database connections or `@nestjs/testing` dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/004-posts/
├── plan.md              # Implementation plan (this file)
├── research.md          # Data model, media storage, pinning constraint & soft deletion research
├── data-model.md        # Prisma models, domain entities, repository contracts & validation rules
├── quickstart.md        # Migration setup and manual verification scenarios
├── contracts/
│   └── endpoints.md     # REST API JSON contracts for post and comment routes
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                                     # Add Post and Comment models

src/
├── core/
│   ├── entities/
│   │   ├── post.entity.ts                            # Domain Post entity
│   │   └── comment.entity.ts                         # Domain Comment entity
│   └── abstracts/
│       ├── post-repository.abstract.ts               # Abstract IPostRepository
│       └── comment-repository.abstract.ts            # Abstract ICommentRepository
│
├── use-cases/
│   └── post/
│       ├── create-post.usecase.ts                    # Create post use-case
│       ├── get-feed.usecase.ts                       # Get user feed use-case
│       ├── pin-post.usecase.ts                       # Pin/unpin post use-case
│       ├── delete-post.usecase.ts                    # Soft delete post use-case
│       ├── create-comment.usecase.ts                 # Add comment use-case
│       └── get-comments.usecase.ts                   # List comments use-case
│
├── infrastructure/
│   └── frameworks/
│       └── database/
│           ├── prisma-post.repository.ts             # Concrete Prisma IPostRepository implementation
│           └── prisma-comment.repository.ts          # Concrete Prisma ICommentRepository implementation
│
└── controllers/
    ├── post.controller.ts                            # HTTP endpoints for /api/v1/posts
    └── dto/
        ├── create-post.dto.ts                        # DTO for post creation
        ├── pin-post.dto.ts                           # DTO for post pinning
        └── create-comment.dto.ts                     # DTO for comment creation
```

**Structure Decision**: Option 1 (Single project), following VibeU's established Clean Hexagonal Architecture structure in NestJS.

## Complexity Tracking

*No constitution check violations.*
