# Implementation Plan: User Profile 'Me' Management

**Branch**: `003-me` | **Date**: 2026-07-20 | **Spec**: [spec.md](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/003-me/spec.md)

**Input**: Feature specification from `/specs/003-me/spec.md`

## Summary
The goal is to implement Profile editing for VibeU backend. This covers dashboard summaries, profile property editing (nickname, birthday, bio, avatar seed), validation safeguards for read-only fields, and interest tags updating.

## Technical Context

**Language/Version**: TypeScript / Node.js 24+

**Primary Dependencies**: NestJS 11, Prisma Client 7.8

**Storage**: PostgreSQL (via Prisma ORM)

**Testing**: Jest (pure TypeScript testing for Use Cases; supertest for E2E)

**Target Platform**: Node.js runtime / PostgreSQL

**Project Type**: web-service (NestJS REST API)

**Performance Goals**:
- Profile dashboard response time under 100ms.
- Fast, non-blocking transactional queries for tag batch swaps.

**Constraints**:
- Read-only integrity: Prevent manual mutations to `gender` and `personalityArchetypeId` in use-case layers.
- Strict DTO validation using `class-validator` and `ValidationPipe`.
- Follow Hexagonal Architecture separating use-cases from framework classes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Flat Clean Architecture Compliance**: Yes. All domain entities and repository interfaces will be written in `src/core/entities` and `src/core/abstracts`. All core business logic resides in `src/use-cases`. Concrete data access and AI integrations reside in `src/infrastructure`.
- **The Dependency & Repository Rule**: Yes. Service layer / use-cases program exclusively against contracts (interfaces) and use interface tokens for NestJS DI injection.
- **Envelope Pattern**: Yes. Response payload and errors are enveloped globally.
- **Repository Mocking**: Yes. Use-case unit tests will mock repositories without connecting to a database or importing `@nestjs/testing`.

## Project Structure

### Documentation (this feature)

```text
specs/003-me/
├── plan.md              # This file
├── research.md          # Decisions on aggregation queries and settings mapping
├── data-model.md        # Prisma UserProfile additions
├── quickstart.md        # Verification scripts and run guide
└── contracts/
    └── endpoints.md     # HTTP routes and request/response shapes
```

### Source Code (repository root)

```text
src/
├── use-cases/
│   └── profile/
│       ├── get-profile-me.usecase.ts
│       ├── update-profile-me.usecase.ts
│       └── update-profile-tags.usecase.ts
└── controllers/
    └── profile.controller.ts
```

**Structure Decision**: Option 1 (Single project), following Clean Hexagonal Architecture boundaries in NestJS.

## Complexity Tracking

*No constitution check violations.*
