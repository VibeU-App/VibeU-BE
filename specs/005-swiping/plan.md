# Implementation Plan: Profile Swiping & Matching (Swiping Domain)

**Branch**: `13-09-spec` | **Date**: 2026-09-13 | **Spec**: [specs/005-swiping/spec.md](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/005-swiping/spec.md)

**Input**: Feature specification from `specs/005-swiping/spec.md`

---

## Summary

Implement the core Swiping & Matching domain for VibeU with two primary flows:
1. **Candidate Discovery Deck**: Fetches a curated queue of eligible profile cards strictly filtered to show ONLY users of the opposite sex (female users see male profiles, male users see female profiles), excluding the viewer, uncompleted profiles, and profiles already swiped on via a PostgreSQL `NOT EXISTS` anti-join.
2. **Swiping & Instant Mutual Match Detection**: Records swipe decisions (`LIKE` or `PASS`), immediately detects reciprocal likes within an atomic database transaction using canonical user ID ordering (`user1Id < user2Id`) to prevent deadlocks and duplicate records, and supports match list retrieval and unmatching.

All operations adhere strictly to the "PostgreSQL for everything" rule and the VibeU NestJS Constitution (Flat Clean Architecture, Envelope Pattern, Pure TypeScript use case tests).

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 20+ LTS  
**Primary Dependencies**: NestJS 11, Prisma ORM 6, `@prisma/client`, `class-validator`, `class-transformer`  
**Storage**: PostgreSQL 16+ (Relational tables `swipes`, `matches`, `profiles`, `users` with B-Tree indexes)  
**Testing**: Jest (Pure TypeScript unit tests for use cases without `@nestjs/testing`, mocking repositories)  
**Target Platform**: Linux / Docker / Node.js runtime  
**Project Type**: Monolithic Web API backend (Clean / Hexagonal architecture)  
**Performance Goals**: Swipe registration < 150ms; mutual match detection < 50ms; candidate deck generation (15 cards) < 100ms  
**Constraints**: Zero Redis dependency; strict opposite-sex candidate presentation; envelope response pattern on all HTTP responses  
**Scale/Scope**: 4 REST endpoints (`POST /swipes`, `GET /swipes/deck`, `GET /swipes/matches`, `DELETE /swipes/matches/:matchId`)  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Verification in this Feature |
| :--- | :--- | :--- | :--- |
| **1. Flat Clean Architecture** | Domain (`core/`), Application (`use-cases/`), Infrastructure (`infrastructure/`), Presentation (`controllers/`) | **PASS** | Entities in `src/core/entities/`, ports in `src/core/abstracts/`, use cases in `src/use-cases/swiping/`, Prisma repos in `src/infrastructure/frameworks/database/`, controller in `src/controllers/swipe.controller.ts` |
| **2. Dependency & Repository Rule** | Use cases program exclusively against repository interfaces; DI with tokens | **PASS** | `CreateSwipeUseCase`, `GetSwipeDeckUseCase`, `GetMatchesUseCase`, `UnmatchUseCase` inject `@Inject('ISwipeRepository')` and `@Inject('IMatchRepository')` |
| **3. The Envelope Pattern** | All responses wrapped in `{ metadata, data, statusCode, message }` | **PASS** | Formatted via global NestJS `TransformInterceptor` |
| **4. Centralized Error Handling** | Global exception filter maps domain/HTTP exceptions into envelope | **PASS** | Uses NestJS `BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException` caught by global filter |
| **5. Repository Mocking Rule** | Unit tests never connect to real database; use mock repository classes | **PASS** | Pure TypeScript tests instantiate mock `ISwipeRepository` and `IMatchRepository` |
| **6. Pure TypeScript Testing** | Application tests DO NOT import `@nestjs/testing` | **PASS** | Tests in `src/use-cases/swiping/*.spec.ts` are pure TS Jest tests |
| **7. Coding Standards** | `ValidationPipe`, `class-validator`, strict types, no `any` | **PASS** | DTOs in `src/controllers/dtos/swipe/` with strict validators |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-swiping/
├── plan.md              # This plan document
├── research.md          # Phase 0: Opposite-sex anti-join query, canonical match ordering, concurrency
├── data-model.md        # Phase 1: Prisma models (Swipe, Match), entities, repository ports
├── quickstart.md        # Phase 1: End-to-end verification scenarios and validation steps
└── contracts/
    └── endpoints.md     # Phase 1: REST API contracts for 4 swipe endpoints
```

### Source Code Layout

```text
prisma/
└── schema.prisma                                     # Swipe and Match models, relations

src/
├── core/
│   ├── entities/
│   │   ├── swipe.entity.ts                          # Swipe domain entity
│   │   ├── match.entity.ts                          # Match domain entity
│   │   └── candidate-card.entity.ts                 # Candidate deck profile snapshot entity
│   └── abstracts/
│       ├── swipe-repository.interface.ts            # ISwipeRepository port contract
│       └── match-repository.interface.ts            # IMatchRepository port contract
│
├── use-cases/
│   └── swiping/
│       ├── create-swipe.use-case.ts                 # Records swipe & triggers mutual match logic
│       ├── create-swipe.use-case.spec.ts            # Pure TS unit test
│       ├── get-swipe-deck.use-case.ts               # Fetches opposite-sex candidate deck
│       ├── get-swipe-deck.use-case.spec.ts          # Pure TS unit test
│       ├── get-matches.use-case.ts                  # Retrieves mutual match list
│       ├── get-matches.use-case.spec.ts             # Pure TS unit test
│       ├── unmatch.use-case.ts                      # Deletes match while preserving swipes
│       └── unmatch.use-case.spec.ts                 # Pure TS unit test
│
├── infrastructure/
│   └── frameworks/
│       └── database/
│           ├── swipe.repository.ts                  # Prisma implementation of ISwipeRepository
│           ├── match.repository.ts                  # Prisma implementation of IMatchRepository
│           └── database.module.ts                   # Providers & exports for ISwipeRepository & IMatchRepository
│
└── controllers/
    ├── dtos/
    │   └── swipe/
    │       ├── create-swipe.dto.ts                  # Target user ID & isLike boolean validation
    │       └── get-swipe-deck-query.dto.ts          # Limit query parameter validation
    ├── swipe.controller.ts                          # Endpoints: POST /swipes, GET /swipes/deck, GET /swipes/matches, DELETE /swipes/matches/:id
    └── swipe.module.ts                              # Swipe controller & use-cases wiring
```

**Structure Decision**: Fully adheres to VibeU's established Flat Clean Architecture pattern, placing domain entities and interfaces in `src/core/`, use-cases in `src/use-cases/swiping/`, database repositories in `src/infrastructure/frameworks/database/`, and presentation controllers in `src/controllers/`.

---

## Complexity Tracking

*No constitutional violations identified. Zero architectural bypasses required.*
