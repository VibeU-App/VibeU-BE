# Feature Specification: Profile Swiping & Matching (Swiping Domain)

**Feature Branch**: `005-swiping`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "I want to have spec for the swiping. Like they can swipe right to like, swipe left to decline, like tinder."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Swiping on Profile Cards (Priority: P1) 🎯 MVP

Authenticated users must be able to view a deck of candidate profile cards and register a swipe decision: swipe right (Like) to indicate romantic/social interest, or swipe left (Pass/Decline) to skip.

**Why this priority**: Core interaction mechanic of the dating/matching domain and the primary driver of user engagement.

**Independent Test**: Can be fully tested by loading candidate profile cards, submitting a right swipe (Like) or left swipe (Pass), and verifying the decision is recorded and the profile does not reappear in subsequent decks.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing a candidate profile card, **When** they swipe right (Like), **Then** the system records a positive swipe interaction associated with their user profile and advances to the next candidate card.
2. **Given** an authenticated user viewing a candidate profile card, **When** they swipe left (Pass/Decline), **Then** the system records a negative swipe interaction associated with their user profile and advances to the next candidate card.
3. **Given** an authenticated user attempting to swipe, **When** the target user ID matches their own user ID, **Then** the system rejects the swipe with a validation error.
4. **Given** an authenticated user attempting to swipe on someone they have already swiped on, **When** they submit a duplicate swipe, **Then** the system rejects the request with a conflict error.

---

### User Story 2 - Instant Mutual Match Detection (Priority: P1)

When a user swipes right on someone who has already swiped right on them, the system must immediately detect the mutual interest, form a match, and notify the user in the swipe response.

**Why this priority**: The primary emotional payoff and value proposition of the matching application ("It's a Match!").

**Independent Test**: Can be fully tested by User A swiping right on User B, then User B swiping right on User A, verifying that User B's swipe response confirms `isMatch: true` and a shared match record is created.

**Acceptance Scenarios**:

1. **Given** User A has already swiped right on User B, **When** User B swipes right on User A, **Then** the system detects mutual right swipes, creates a match record between User A and User B, and returns `isMatch: true` along with User A's profile summary (nickname, avatar, university).
2. **Given** User A has not swiped on User B (or swiped left), **When** User B swipes right on User A, **Then** the system records User B's like, does not create a match, and returns `isMatch: false`.
3. **Given** User A and User B swiping right on each other concurrently, **When** both requests process simultaneously, **Then** database transactions ensure exactly one mutual match record is created with zero duplicate match entries.

---

### User Story 3 - Candidate Discovery Card Deck with Opposite-Sex Filtering (Priority: P1)

Authenticated users must be able to fetch a curated batch of eligible profile cards to swipe through, strictly filtered to show only users of the opposite sex (female users see male profiles; male users see female profiles).

**Why this priority**: Users cannot swipe without a queue of eligible, active campus profiles to evaluate, and dating interactions require presenting compatible opposite-sex candidate profiles.

**Independent Test**: Can be fully tested by requesting candidate cards for a female user (confirming 100% of returned cards are male) and for a male user (confirming 100% of returned cards are female), and verifying that returned profiles exclude the viewer themselves, exclude already-swiped users, and contain full presentation details (photos, nickname, bio, university, archetype, hobbies).

**Acceptance Scenarios**:

1. **Given** an authenticated female user opening the swipe screen, **When** the card deck loads, **Then** the system returns up to 15 eligible candidate profile cards belonging exclusively to male users, containing nickname, age/birthdate, university, bio, avatar seed, profile photos, hobbies, and personality archetype.
2. **Given** an authenticated male user opening the swipe screen, **When** the card deck loads, **Then** the system returns up to 15 eligible candidate profile cards belonging exclusively to female users.
3. **Given** a user who has previously swiped on Candidate X (either right or left), **When** the user fetches a new batch of candidate cards, **Then** Candidate X is strictly omitted from the deck.
4. **Given** a user who has evaluated all available opposite-sex profiles in their campus network, **When** they request candidate cards, **Then** the system returns an empty deck with an indicator that no new profiles are currently available.

---

### User Story 4 - Viewing & Managing Matches (Priority: P2)

Authenticated users must be able to view all their current mutual matches and remove (unmatch) connections if desired.

**Why this priority**: Allows users to review their connections, initiate direct contact/chat, and curate their match list.

**Independent Test**: Can be fully tested by fetching the match list for an account with multiple matches, verifying all matched profiles appear in descending order of match time, and unmatching a connection to confirm immediate removal.

**Acceptance Scenarios**:

1. **Given** an authenticated user opening their Matches tab, **When** the list loads, **Then** all active mutual matches are displayed with the matched user's nickname, avatar seed, university, match timestamp, and personality archetype.
2. **Given** an authenticated user with an active match, **When** they choose to unmatch the connection, **Then** the system removes the match record, and neither user appears in the other's match list.

---

### Edge Cases

- **Self-Swipe Prevention**: Users cannot swipe on their own profile ID under any circumstance.
- **Opposite-Sex Matching Invariant**: A user is never presented with candidate cards of the same sex or an undefined sex; gender comparison is case-insensitive (`MALE`/`FEMALE`).
- **Swipe Duplication & Idempotency**: Submitting duplicate swipes on the same target profile is rejected with HTTP 409 Conflict.
- **Concurrent Mutual Swipes**: If two users swipe right on each other at the exact same millisecond, an atomic database transaction guarantees that exactly one match record is generated.
- **Deleted Account Swiping**: If a candidate account is deactivated or soft-deleted before a swipe is processed, the swipe is rejected with HTTP 404 Not Found and omitted from future decks.
- **Unmatched Re-Swiping**: Once two users unmatch, they do not reappear in each other's swipe card deck.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to submit a swipe decision (`LIKE` or `PASS`) on a target user profile.
- **FR-002**: The system MUST reject any swipe request where the target user ID equals the authenticated user ID (no self-swipes).
- **FR-003**: The system MUST enforce that a user can record at most one swipe interaction per target profile.
- **FR-004**: The system MUST synchronously evaluate whether a reciprocal `LIKE` swipe exists whenever a user submits a `LIKE` swipe.
- **FR-005**: The system MUST create an atomic `Match` record when mutual `LIKE` swipes are detected and return `isMatch: true` in the swipe response.
- **FR-006**: The system MUST return `isMatch: false` in the swipe response when no reciprocal like exists.
- **FR-007**: The system MUST provide a discovery endpoint returning a batch of candidate profile cards (default 15 profiles) for the authenticated user.
- **FR-008**: The system MUST strictly enforce the following eligibility and exclusion filters when assembling the candidate discovery deck:
  1. **Opposite-Sex Filter**: The system MUST return ONLY profiles with the opposite sex/gender of the authenticated user (female users receive male candidates; male users receive female candidates).
  2. **Self-Exclusion**: The system MUST exclude the authenticated user's own profile.
  3. **Swipe-Exclusion**: The system MUST exclude any profile the authenticated user has already swiped on (`LIKE` or `PASS`).
  4. **Account & Profile Completion**: The system MUST exclude profiles that are uncompleted (`isCompleted = false`), inactive, pending, or soft-deleted (`deletedAt IS NOT NULL`).
- **FR-009**: The system MUST provide a matches endpoint returning all active mutual matches for the authenticated user, sorted with newest matches first (`createdAt DESC`).
- **FR-010**: The system MUST allow an authenticated user to unmatch an existing connection, removing the mutual match.
- **FR-011**: The system MUST resolve all swipe storage, opposite-sex candidate filtering, and match resolution natively in PostgreSQL.

---

### Key Entities

- **Swipe**:
  - `id`: Unique identifier (UUID).
  - `swiperId`: Foreign key to user initiating the swipe (UUID).
  - `targetId`: Foreign key to target user being swiped on (UUID).
  - `isLike`: Boolean flag (`true` for Like/Swipe Right, `false` for Pass/Swipe Left).
  - `createdAt`: ISO 8601 timestamp of swipe creation.
  - *Constraint*: `(swiperId, targetId)` unique composite index.

- **Match**:
  - `id`: Unique identifier (UUID).
  - `user1Id`: Foreign key to first matched user (UUID).
  - `user2Id`: Foreign key to second matched user (UUID).
  - `createdAt`: ISO 8601 timestamp of mutual match creation.
  - *Constraint*: `(user1Id, user2Id)` unique composite index.

- **CandidateCard**:
  - Profile snapshot returned in swipe deck: `userId`, `nickname`, `gender` (strictly opposite of viewer), `birthday`, `university`, `bio`, `avatarSeed`, `photos`, `hobbies`, and `personalityArchetype`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Swipe submission requests respond in under 150 milliseconds.
- **SC-002**: Mutual match detection executes synchronously within the swipe transaction in under 50 milliseconds additional latency.
- **SC-003**: Discovery card deck queries (batch of 15 candidate profiles) execute in under 100 milliseconds directly in PostgreSQL.
- **SC-004**: 100% of candidate profiles presented in any discovery deck strictly match the opposite-sex requirement and strictly exclude already-swiped users.
- **SC-005**: 100% of concurrent mutual right-swipe scenarios produce exactly one match record without deadlocks or duplicate records.

---

## Assumptions & Technical Constraints

- **A-001 (Direct PostgreSQL Architecture)**: All candidate deck exclusion filtering (`NOT IN (SELECT target_id FROM swipes WHERE swiper_id = X)`), swipe recording, and match creation are performed directly in PostgreSQL using B-Tree compound indexes.
- **A-002 (Identity & Authentication)**: Swiper identity is securely resolved from the authenticated JWT session context.
- **A-003 (Profile Eligibility)**: Only profiles that have completed their profile setup (`isCompleted = true` and `accountStatus = ACTIVE`) are eligible to appear in candidate discovery decks.
