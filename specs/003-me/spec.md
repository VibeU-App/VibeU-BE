# Feature Specification: User Profile 'Me' Management

**Feature Branch**: `003-me`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "we didn't touch the language and noti settings right now, just remove that work"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile Dashboard Viewing (Priority: P1)

Users must be able to view their profile dashboard containing their nickname, avatar, biography, interest tags, matched AI archetype (Vibe testing), computed age/zodiac, and aggregate stats (number of outposts/posts, matches/matchlist count).

**Why this priority**: Acts as the central hub for the user's identity and is a prerequisite for editing.

**Independent Test**: Can be verified by fetching the user's dashboard data and confirming all personal attributes, computed age/zodiac, and stats (obtained from read-only sources) return correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they fetch their profile dashboard, **Then** the system returns their profile details (nickname, avatar seed, biography text, zodiac sign, age, and AI archetype) along with aggregate stats for posts and matches.

---

### User Story 2 - Profile Details Editing (Priority: P1)

Users must be able to update their editable profile fields (nickname, birthday/date of birth, biography/about me, and avatar seed) via the Profile Edit screen. Certain fields like Sex (gender) and Vibe testing (AI personality archetype) must remain read-only.

**Why this priority**: Crucial for profile personalization and user autonomy.

**Independent Test**: Can be tested by updating individual fields (nickname, birthday, biography, avatar seed) and verifying the changes are saved, while attempting to modify read-only fields results in rejection.

**Acceptance Scenarios**:

1. **Given** a user on the Profile Edit screen, **When** they submit a new nickname, biography, or avatar seed, **Then** the system updates their profile details.
2. **Given** a user on the Profile Edit screen, **When** they submit an updated date of birth, **Then** the system saves the new date and dynamically recalculates their age and zodiac.
3. **Given** a user attempting to update their profile, **When** they attempt to modify their registered Sex or their matched Vibe testing archetype, **Then** the system rejects the change.

---

### User Story 3 - Interest Tags Updating (Priority: P1)

Users must be able to update their selected interest/hobby tags (between 3 and 10 tags total) from the Profile Edit screen.

**Why this priority**: Standard profile maintenance to keep interest matching updated.

**Independent Test**: Verify by sending a payload with a revised set of tag IDs and checking that they correctly replace the previous selection.

**Acceptance Scenarios**:

1. **Given** a user editing their interest tags, **When** they select and save a new combination of tags (between 3 and 10 tags total), **Then** the system updates their profile's tag list.
2. **Given** a tag update request, **When** the total count of tags is less than 3 or more than 10, **Then** the system rejects the update.

---

### Edge Cases

- **Outposts and Matches Stats Sync**: The stats displaying counts of "outposts/posts" and "matches" are read-only aggregation views. The backend must query these counts from the Posts and Matchmaking tables dynamically or cache them correctly to avoid mismatches.
- **Nickname Validation**: Nicknames modified in settings must follow the same rules as initial registration (2-30 characters, alphanumeric, no inappropriate words).
- **Date of Birth limits**: Changing the birthday must still ensure the user is at least 18 years old.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to retrieve their profile dashboard details (nickname, avatar seed, biography text, zodiac sign, age, AI archetype, and aggregate counts of posts/matches).
- **FR-002**: The system MUST support updating a user's nickname, biography (about me), avatar seed, date of birth, and university.
- **FR-003**: The system MUST prevent any manual updates to the user's Sex (gender) and matched AI personality archetype (Vibe testing) fields after initial profiling completion.
- **FR-004**: The system MUST support updating the user's selected interest/hobby tags (hobbies), enforcing the constraint of minimum 3 and maximum 10 tags.
- **FR-005**: The system MUST dynamically query and aggregate the post count (outposts) and match count (matchlist) from their respective domains when rendering the dashboard.

### Key Entities *(include if feature involves data)*

- **Profile** (Updated):
  - `nickname`: Display name / Full name of the user (String).
  - `bio`: Short user description (String, max 150 characters, nullable).
  - `university`: Name of university (String, nullable).
  - `avatarSeed`: Value used to generate the user's avatar image (String).
  - `birthday`: Date of birth (Date).
  - `gender`: Biological sex (Read-only after initial setup).
  - `personalityArchetypeId`: AI matched archetype ID (Read-only after initial setup).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Retrieving and updating profile details must respond in under 100 milliseconds.
- **SC-002**: Verification of age and validation constraints during birthday/nickname updates must introduce zero database locks.

## Assumptions

- **A-001**: Post count and match counts are aggregated via query calculations from their respective schemas, which are designed/exposed in separate domains.
- **A-002**: The frontend manages the physical Dicebear rendering client-side; the backend only stores and validates the text avatar seed and style.
