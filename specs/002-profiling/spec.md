# Feature Specification: User Profiling & AI Personality Archetype

**Feature Branch**: `002-profiling`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "create spec for the 'Profiling' domain. I already have used with auth, now generate for the 'Profiling' for this Nestjs project. I have shown you all the pages for the profiling domain in the FE. You will generate the work for BE. We also have a part to call AI API to get the character through the questionaire. You also need to inspect which entity should be created or field add to existing entity"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Profile Setup (Priority: P1)

Registered users must be able to initialize and save their basic profile information to establish their identity on the platform.

**Why this priority**: Core identity setup is the absolute prerequisite for any personalization, matching, or social interaction features.

**Independent Test**: Can be fully tested by submitting a basic profile payload (gender, nickname, birthday, avatar selection) for a newly registered user and verifying that the profile is saved and can be retrieved.

**Acceptance Scenarios**:

1. **Given** a registered user with no profile, **When** they submit a nickname, gender, birthday, and avatar selection, **Then** their profile is successfully created and marked as in-progress.
2. **Given** a user submitting profile data, **When** the nickname is empty or contains forbidden characters, **Then** the system rejects the submission with a clear error.
3. **Given** a user submitting a birthday, **When** the birth date is in the future or indicates the user is under the minimum age limit (e.g., 18 years old), **Then** the system rejects the request.

---

### User Story 2 - Interest & Hobby Selection (Priority: P1)

Users must be able to select descriptive tags representing their hobbies and interests across predefined categories to help customize their experience.

**Why this priority**: Hobbies and tags are essential for matchmaking and community features, forming the secondary layer of a user's profile.

**Independent Test**: Can be fully tested by submitting a list of selected hobby tags for a profile and verifying that they are correctly associated and retrieved.

**Acceptance Scenarios**:

1. **Given** a user completing their profile, **When** they select between 3 and 10 tags across the provided categories (Personality, Communication Style, Sport, Pet, Food), **Then** the system updates their profile with these tags.
2. **Given** a user selecting tags, **When** they select fewer than 3 tags or more than 10 tags in total, **Then** the system rejects the submission.

---

### User Story 3 - AI-Powered Personality Archetype Matching (Priority: P2)

Users must complete a brief questionnaire to receive a matched personality archetype/character (hình mẫu nhân vật) from a predefined database list, determined by AI analysis of their answers and interests.

**Why this priority**: The personality matching adds high engagement value and personalization, but relies on a predefined list of archetypes and requires user profiles and answers to exist first.

**Independent Test**: Can be verified by submitting questionnaire answers, triggering the AI matching engine, and confirming that the user profile is associated with one of the predefined database archetypes.

**Acceptance Scenarios**:

1. **Given** a user who has completed the basic profile and selected hobbies, **When** they submit answers to all 5 questionnaire questions, **Then** the system uses the AI engine with the configured prompt to classify their response into exactly one of the predefined archetypes stored in the database, updating the user's profile accordingly.
2. **Given** a questionnaire submission, **When** any of the questions are unanswered, **Then** the system rejects the submission and does not invoke the AI matching engine.
3. **Given** an AI classification failure, **When** the user submits their questionnaire, **Then** the system handles the failure gracefully by assigning a default database fallback archetype so the user profile setup is not blocked.

---

### User Story 4 - Retrieve Profile Summary (Priority: P2)

Users and other authorized actors can view a user's completed profile, including computed astrological zodiac signs (cung hoàng đạo) and age.

**Why this priority**: Viewing the completed profile is the primary way other users interact with the profile data.

**Independent Test**: Can be tested by retrieving the profile of a user with a known birthdate and verifying the computed age and zodiac sign are correct.

**Acceptance Scenarios**:

1. **Given** a user with a saved birthday (e.g., Jan 15, 2006), **When** their profile is retrieved, **Then** the system returns their profile details along with their computed age (e.g., 20 years old) and correct zodiac sign (e.g., Capricorn).

---

### Edge Cases

- **AI Timeout/Outage**: If the external AI API is unreachable or times out, the system should either assign a default archetype based on the questionnaire answers or return a friendly "processing" status and retry in the background, rather than returning a 500 error.
- **Duplicate Nicknames**: The system must handle cases where multiple users want the same nickname. Since we need friends to find them, we should either enforce uniqueness or append a unique discriminator (e.g., #1234) if duplicate nicknames are allowed.
- **Incomplete Flow Re-entry**: If a user drops off during Step 3 or 4, they must be returned to their last completed step when they log back in, rather than starting the process from the beginning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to select their gender (Male, Female, or Non-binary/Other) and persist it.
- **FR-002**: The system MUST support storing avatar configuration seeds/parameters (compatible with Dicebear library styles) for generating user avatars.
- **FR-003**: The system MUST validate and store a unique or display full name for each user profile.
- **FR-004**: The system MUST validate and store the user's date of birth.
- **FR-005**: The system MUST dynamically calculate and return the user's age and astrological zodiac sign based on their stored date of birth.
- **FR-006**: The system MUST maintain a categorized dictionary of hobbies (Categories: Personality, Communication Style, Sport, Pet, Food).
- **FR-007**: The system MUST enforce that a user associates a minimum of 3 and a maximum of 10 hobbies with their profile.
- **FR-008**: The system MUST store a predefined pool of questionnaire questions and multiple-choice options.
- **FR-009**: The system MUST record user answers to the profile questionnaire.
- **FR-010**: The system MUST maintain a predefined pool of personality archetypes (hình mẫu nhân vật) in the database.
- **FR-011**: The system MUST analyze the user's questionnaire answers and selected interest tags using an AI classification engine guided by a system prompt, mapping the user to exactly one archetype from the predefined pool.
- **FR-012**: The system MUST mark a profile as "completed" only after basic details, hobbies, and questionnaire answers are fully submitted and successfully matched to an archetype.

### Key Entities *(include if feature involves data)*

- **Profile**:
  - `id`: Unique identifier (Int / PK).
  - `userId`: Unique reference to the core User account (One-to-One / FK).
  - `fullName`: Display name / Full name of the user (String).
  - `gender`: Biological sex or gender preference (String).
  - `university`: Educational institution name (String, nullable).
  - `bio`: Short user biography (String, nullable).
  - `avatarSeed`: Value used to generate the user's avatar image (String).
  - `birthday`: Date of birth (Date).
  - `personalityArchetypeId`: Optional reference to the matched PersonalityArchetype (Nullable).
  - `isCompleted`: Indicates if the setup flow has been fully completed (Boolean).
  - `createdAt` / `updatedAt`: Timestamps.

- **PersonalityArchetype**:
  - `id`: Unique identifier (UUID or String).
  - `name`: Name of the archetype (String, e.g., "The Adventurous Innovator").
  - `description`: Detailed narrative of this personality type (Text).
  - `traits`: List of key trait labels (Array of Strings).
  - `imageUrl`: Visual representation or icon key for the archetype (String, optional).
  - `createdAt` / `updatedAt`: Timestamps.

- **Hobby**:
  - `id`: Unique identifier (Int / PK LUT).
  - `name`: Name of the hobby/interest (String, e.g., "Introverted", "Football", "Cats").
  - `category`: Category name (String: `PERSONALITY`, `COMMUNICATION_STYLE`, `SPORT`, `PET`, `FOOD`).

- **ProfileHobby** (Join Entity):
  - `profileId`: Reference to Profile (Int / FK).
  - `hobbyId`: Reference to Hobby (Int / FK).

- **ProfilePhoto**:
  - `id`: Unique identifier (Int / PK).
  - `profileId`: Reference to Profile (Int / FK).
  - `url`: Media storage URL of the photo (String).

- **QuestionnaireQuestion**:
  - `id`: Unique identifier.
  - `text`: The question text (String).
  - `order`: Display sequence position (Integer).

- **QuestionnaireOption**:
  - `id`: Unique identifier.
  - `questionId`: Reference to the QuestionnaireQuestion.
  - `text`: Option choice text (String).

- **UserQuestionnaireAnswer**:
  - `id`: Unique identifier.
  - `profileId`: Reference to Profile (Int / FK).
  - `questionId`: Reference to QuestionnaireQuestion.
  - `selectedOptionId`: Reference to QuestionnaireOption.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users who start the profiling flow can complete all steps (including avatar, basic details, tags, and questionnaire) in under 4 minutes.
- **SC-002**: The backend computes and returns the correct age and zodiac sign within 100 milliseconds of a profile retrieval request.
- **SC-003**: The AI personality archetype generation takes no longer than 3 seconds to process, with a fallback system triggering if the AI API fails to respond within that window.
- **SC-004**: Less than 1% of users encounter validation errors during profile completion when using the standard client application flows.

## Assumptions

- **A-001**: Users must have completed the basic registration/auth flow and hold a valid session before starting the profiling process.
- **A-002**: Astrological zodiac calculations are based on standard Western tropical zodiac dates.
- **A-003**: The Dicebear avatar library is integrated on the frontend, and the backend only needs to persist the seed and style name.
- **A-004**: Predefined questions, hobby tags, and personality archetypes will be seeded into the database and managed by administrators.
- **A-005**: The AI matching engine will only classify users into existing, predefined archetypes rather than generating new ones dynamically.
