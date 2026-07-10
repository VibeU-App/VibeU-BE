# Tasks: User Authentication

**Input**: Design documents from `/specs/001-user-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD is required per constitution - AuthService MUST be unit tested with mocked IUserRepository using pure TypeScript (no @nestjs/testing).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install dependencies: class-validator, class-transformer, bcrypt, jsonwebtoken, @nestjs/jwt, @nestjs/passport, passport, passport-jwt, typeorm, pg
- [ ] T002 Create auth module directory structure per plan.md: src/modules/auth/{domain,application,infrastructure,presentation}
- [ ] T003 Create src/core/interceptors/envelope.interceptor.ts for Envelope Pattern
- [ ] T004 Create src/core/filters/exception.filter.ts for centralized error handling
- [ ] T005 Configure global ValidationPipe in src/main.ts
- [ ] T006 Register AuthModule in src/app.module.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 [P] Create UserRole enum in src/modules/auth/domain/entities/user.entity.ts
- [ ] T008 [P] Create UserEntity class in src/modules/auth/domain/entities/user.entity.ts
- [ ] T009 [P] Create IUserRepository interface in src/modules/auth/application/interfaces/user-repository.interface.ts
- [ ] T010 [P] Create TypeORM UserModel entity in src/modules/auth/infrastructure/models/user.model.ts
- [ ] T011 Create UserRepositoryImpl in src/modules/auth/infrastructure/repositories/user-repository.impl.ts implementing IUserRepository
- [ ] T012 Create PasswordHashingService in src/modules/auth/infrastructure/security/password-hashing.service.ts using bcrypt
- [ ] T013 Create JwtStrategy in src/modules/auth/infrastructure/security/jwt.strategy.ts
- [ ] T014 Create AuthService in src/modules/auth/application/services/auth.service.ts with IUserRepository dependency

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts with email and password

**Independent Test**: Submit registration credentials and receive success response with user data

### Tests for User Story 1 (TDD - Required per Constitution) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Create unit test for AuthService.register in tests/unit/auth/auth.service.spec.ts with mocked IUserRepository
- [ ] T016 [P] [US1] Create SignUpDto with validation decorators in src/modules/auth/presentation/dto/signup.dto.ts

### Implementation for User Story 1

- [ ] T017 [US1] Implement AuthService.register method in src/modules/auth/application/services/auth.service.ts
- [ ] T018 [US1] Create AuthController with POST /register endpoint in src/modules/auth/presentation/controllers/auth.controller.ts
- [ ] T019 [US1] Wire AuthController and AuthService in AuthModule

**Checkpoint**: User registration should be fully functional - users can register and receive user data

---

## Phase 4: User Story 2 - User Login (Priority: P1)

**Goal**: Allow registered users to authenticate and receive JWT tokens

**Independent Test**: Submit valid credentials and receive authentication token

### Tests for User Story 2 (TDD - Required per Constitution) ⚠️

- [ ] T020 [P] [US2] Create unit test for AuthService.login in tests/unit/auth/auth.service.spec.ts
- [ ] T021 [P] [US2] Create LoginDto with validation decorators in src/modules/auth/presentation/dto/login.dto.ts

### Implementation for User Story 2

- [ ] T022 [US2] Implement AuthService.login method in src/modules/auth/application/services/auth.service.ts
- [ ] T023 [US2] Add POST /login endpoint to AuthController in src/modules/auth/presentation/controllers/auth.controller.ts
- [ ] T024 [US2] Implement JWT token generation with role in payload

**Checkpoint**: User login should be fully functional - users can authenticate and receive tokens

---

## Phase 5: User Story 3 - Token Validation (Priority: P2)

**Goal**: Enable automatic token validation for protected resources

**Independent Test**: Send request with valid token and verify access to protected content

### Tests for User Story 3 (TDD - Required per Constitution) ⚠️

- [ ] T025 [P] [US3] Create unit test for AuthService.validateToken in tests/unit/auth/auth.service.spec.ts

### Implementation for User Story 3

- [ ] T026 [US3] Implement AuthService.validateToken method in src/modules/auth/application/services/auth.service.ts
- [ ] T027 [US3] Add GET /profile endpoint to AuthController in src/modules/auth/presentation/controllers/auth.controller.ts
- [ ] T028 [US3] Create JwtAuthGuard in src/modules/auth/presentation/guards/jwt-auth.guard.ts

**Checkpoint**: Token validation should be fully functional - protected endpoints require valid tokens

---

## Phase 6: User Story 4 - Role-Based Endpoint Access (Priority: P2)

**Goal**: Protect endpoints with role requirements using middleware

**Independent Test**: Access admin endpoint with admin role (success) and with user role (forbidden)

### Tests for User Story 4 (TDD - Required per Constitution) ⚠️

- [ ] T029 [P] [US4] Create unit test for RolesGuard in tests/unit/auth/roles.guard.spec.ts

### Implementation for User Story 4

- [ ] T030 [US4] Create @Roles() decorator in src/modules/auth/presentation/decorators/roles.decorator.ts
- [ ] T031 [US4] Create RolesGuard in src/modules/auth/presentation/guards/roles.guard.ts
- [ ] T032 [US4] Add GET /admin/users endpoint with @Roles('admin') to AuthController
- [ ] T033 [US4] Implement role verification in RolesGuard reading from JWT payload

**Checkpoint**: Role-based access control should be fully functional - endpoints enforce role requirements

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T034 [P] Run quickstart.md validation scenarios
- [ ] T035 Ensure all responses follow Envelope Pattern format
- [ ] T036 Verify error responses use centralized exception filter
- [ ] T037 Add comprehensive error messages for all failure cases
- [ ] T038 Verify strict TypeScript (no `any` types) across all files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 (P1) can run in parallel after Phase 2
  - US3 and US4 (P2) can run in parallel after Phase 2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares AuthService with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on AuthService
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US3 (token validation)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US2 can start in parallel
- US3 and US4 can start in parallel after Foundational
- All tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch tests and DTOs for User Story 1 together:
Task: "Create unit test for AuthService.register in tests/unit/auth/auth.service.spec.ts"
Task: "Create SignUpDto with validation decorators in src/modules/auth/presentation/dto/signup.dto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. **STOP and VALIDATE**: Test registration independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test registration → Deploy/Demo (MVP!)
3. Add User Story 2 → Test login → Deploy/Demo
4. Add User Story 3 → Test token validation → Deploy/Demo
5. Add User Story 4 → Test role-based access → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration)
   - Developer B: User Story 2 (Login)
3. After US1 & US2 complete:
   - Developer A: User Story 3 (Token Validation)
   - Developer B: User Story 4 (Role-Based Access)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD is MANDATORY per constitution - write failing tests before implementation
- AuthService unit tests MUST use mocked IUserRepository (no @nestjs/testing)
- All HTTP responses MUST follow Envelope Pattern
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently