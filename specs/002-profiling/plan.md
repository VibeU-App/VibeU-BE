# Implementation Plan: User Profiling & AI Personality Archetype Matching

**Branch**: `002-profiling` | **Date**: 2026-07-20 | **Spec**: [spec.md](file:///d:/Ryan/App_project/VibeU/VibeU-BE/specs/002-profiling/spec.md)

**Input**: Feature specification from `/specs/002-profiling/spec.md`

## Summary
The goal is to implement the "Profiling" domain in the NestJS backend to allow registered users to set up their profiles (sex/gender, nickname, birthday, Dicebear avatar seed, hobby tags) and complete a questionnaire to match with a predefined personality archetype using Google Gemini API classification. The design strictly follows the Project Constitution (Flat Clean Architecture, dynamic computations, and Repository patterns).

## Technical Context

**Language/Version**: TypeScript / Node.js 24+

**Primary Dependencies**: NestJS 11, Prisma Client 7.8, Axios or standard native fetch for API requests.

**Storage**: PostgreSQL (via Prisma ORM)

**Testing**: Jest (pure TypeScript testing for Use Cases; supertest for E2E)

**Target Platform**: Node.js runtime / PostgreSQL

**Project Type**: web-service (NestJS REST API)

**Performance Goals**:
- Dynamic age and zodiac calculations under 10ms.
- AI archetype classification matching under 3 seconds.

**Constraints**:
- Keep use-case layer clean from framework code (NestJS / Prisma dependencies).
- Strictly format all HTTP responses through the global envelope interceptor.
- Limit LLM requests to classification mapping of database archetypes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Flat Clean Architecture Compliance**: Yes. All domain entities and repository interfaces will be written in `src/core/entities` and `src/core/abstracts`. All core business logic resides in `src/use-cases`. Concrete data access and AI integrations reside in `src/infrastructure`.
- **The Dependency & Repository Rule**: Yes. Service layer / use-cases program exclusively against contracts (interfaces) and use interface tokens for NestJS DI injection.
- **Envelope Pattern**: Yes. Response payload and errors are enveloped globally.
- **Repository Mocking**: Yes. Use-case unit tests will mock repositories without connecting to a database or importing `@nestjs/testing`.

## Project Structure

### Documentation (this feature)

```text
specs/002-profiling/
├── plan.md              # This file
├── research.md          # Research & Architectural choices
├── data-model.md        # Prisma models & validation rules
├── quickstart.md        # Verification scripts and run guide
└── contracts/
    └── endpoints.md     # HTTP routes and request/response shapes
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── entities/
│   │   ├── user-profile.entity.ts
│   │   ├── hobby-tag.entity.ts
│   │   ├── personality-archetype.entity.ts
│   │   └── questionnaire.entity.ts
│   └── abstracts/
│       ├── user-profile-repository.interface.ts
│       ├── hobby-tag-repository.interface.ts
│       ├── personality-archetype-repository.interface.ts
│       ├── questionnaire-repository.interface.ts
│       └── ai-service.interface.ts
├── use-cases/
│   └── profile/
│       ├── get-profile.use-case.ts
│       ├── save-basic-profile.use-case.ts
│       ├── save-hobbies.use-case.ts
│       └── submit-questionnaire.use-case.ts
├── infrastructure/
│   ├── frameworks/
│   │   └── database/
│   │       ├── prisma-user-profile.repository.ts
│   │       ├── prisma-hobby-tag.repository.ts
│   │       ├── prisma-personality-archetype.repository.ts
│   │       └── prisma-questionnaire.repository.ts
│   └── services/
│       └── gemini-ai.service.ts
└── controllers/
    └── profile.controller.ts
```

**Structure Decision**: Option 1 (Single project), following Clean Hexagonal Architecture boundaries in NestJS.

## Complexity Tracking

*No constitution check violations.*
