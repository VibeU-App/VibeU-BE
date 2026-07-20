# Research Notes: User Profiling & AI Personality Archetype Matching

This document captures the research and architectural decisions made for the User Profiling and AI Personality Questionnaire mapping functionality.

## Technical Decisions

### 1. AI API Integration (Gemini API via REST)

- **Decision**: Integrate Google Gemini API using NestJS `HttpService` or native `fetch` calling the `gemini-1.5-flash` endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`.
- **Rationale**: Native fetch avoids adding extra third-party SDK dependencies (e.g. `@google/generative-ai`) and makes deployment/maintenance simpler. Using the Gemini Flash model ensures fast classification (under 1.5 seconds) and low latency.
- **Alternatives Considered**: 
  - `@google/generative-ai` npm package: Rejected as native `fetch` is simpler and fully sufficient for a basic classification prompt.
  - OpenAI API: Rejected in favor of Google Gemini, which is standard for the project's AI requirements.

---

### 2. Personality Archetype Database Architecture & Seeding

- **Decision**: Create a dedicated database table `personality_archetypes` containing predefined archetype models (e.g., ID, Name, Description, Traits, Image URL). During the profiling setup, these archetypes are seeded. The backend AI prompt will list the available archetypes and direct the LLM to output the matching archetype's ID.
- **Rationale**: Storing archetypes in the database makes them fully queryable and editable without requiring code deployment. It also ensures that the user's profile is linked by foreign key (`personalityArchetypeId`) directly to a valid database record, guaranteeing referential integrity.
- **Alternatives Considered**: 
  - Free-form text archetype generation (stored in `UserProfile` fields): Rejected because it makes user-matching based on archetypes impossible, causes inconsistent wording, and prevents caching/localization of archetype descriptions.

---

### 3. Dynamic Age and Zodiac (Cung Hoàng Đạo) Calculation

- **Decision**: Store the raw `birthday: Date` in the profile. Dynamically calculate the age (tuổi) and zodiac sign (cung hoàng đạo) in the Application layer (Use Cases) whenever a profile is fetched.
- **Rationale**: Keeps database values normalized. Storing age or zodiac as static values in the database causes sync issues (e.g., age changes every year, while zodiac is completely deterministic from birthday).
- **Astrological Date Ranges used (Western Tropical Zodiac)**:
  - **Aries**: Mar 21 - Apr 19
  - **Taurus**: Apr 20 - May 20
  - **Gemini**: May 21 - Jun 20
  - **Cancer**: Jun 21 - Jul 22
  - **Leo**: Jul 23 - Aug 22
  - **Virgo**: Aug 23 - Sep 22
  - **Libra**: Sep 23 - Oct 22
  - **Scorpio**: Oct 23 - Nov 21
  - **Sagittarius**: Nov 22 - Dec 21
  - **Capricorn**: Dec 22 - Jan 19
  - **Aquarius**: Jan 20 - Feb 18
  - **Pisces**: Feb 19 - Mar 20

---

### 4. Hobby Tags Relational Schema

- **Decision**: Set up a relational model with a `hobby_tags` dictionary table and a join table `profile_hobby_tags` (Many-to-Many).
- **Rationale**: Highly optimized for indexing and future matchmaking search queries (e.g., "Find users with similar hobbies"). Enforces data consistency by validation against predefined tag keys.
- **Alternatives Considered**:
  - Store hobbies as a string array/JSON column inside the `UserProfile` table: Rejected due to performance limitations when querying/filtering on individual tags, lack of referential integrity, and difficulty in translating or modifying tag names globally.
