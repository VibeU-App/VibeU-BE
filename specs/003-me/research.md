# Research Notes: User Profile 'Me' & Settings Management

This document details the architectural decisions made for the User Profile Dashboard and Settings features.

## Technical Decisions

### 1. Dynamic Counts Aggregation (Outposts & Matches)

- **Decision**: The backend will aggregate user outpost (post) counts and matchlist counts dynamically using Prisma aggregation queries (`prisma.post.count()` and `prisma.match.count()`) during dashboard fetch requests, rather than storing stateful counters on the `UserProfile` table.
- **Rationale**: Storing counter columns inside the profile table creates data redundancy and leads to desynchronization bugs if a post/match creation fails or is deleted outside of profile-controlled code. Dynamic count queries are extremely fast in PostgreSQL with appropriate indexes on `userId`/`profileId` columns.
- **Alternatives Considered**:
  - Stateful cache triggers/counters: Rejected because it adds transaction complexity and database triggers are harder to maintain in schema migrations.

---

### 2. User Settings Architecture

- **Decision**: Store user configurations (languages, notification preferences) in a distinct table `UserSettings` with a One-to-One mapping to `UserProfile`. Default settings will be initialized automatically in the database when the profile is first created.
- **Rationale**: Separates core social profile details (nickname, birthday, tags) from client-app configurations. Keeps the `UserProfile` table clean, slim, and highly readable.
- **Alternatives Considered**:
  - Store settings as JSON inside a `settings` column in the `UserProfile` table: Rejected because it makes running reports or querying for notification-enabled users more complex and slower.
