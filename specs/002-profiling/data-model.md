# Data Model: User Profiling & AI Personality Archetype Matching

This document specifies the database schemas, TypeScript domain entities, and constraints for the user profiling and questionnaire features.

## Prisma Database Schema Additions

To support profiling, we will add the following models and relations to `prisma/schema.prisma`:

```prisma
// Update existing User model to include relation:
model User {
  // Existing fields ...
  profile UserProfile?
}

// New UserProfile Model
model UserProfile {
  id                     String                    @id @default(uuid())
  userId                 String                    @unique @map("user_id")
  nickname               String
  gender                 String                    // e.g. "MALE", "FEMALE", "OTHER"
  avatarSeed             String                    @map("avatar_seed")
  birthday               DateTime
  personalityArchetypeId String?                   @map("personality_archetype_id")
  isCompleted            Boolean                   @default(false) @map("is_completed")
  createdAt              DateTime                  @default(now()) @map("created_at")
  updatedAt              DateTime                  @updatedAt @map("updated_at")

  // Relations
  user                 User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  personalityArchetype PersonalityArchetype? @relation(fields: [personalityArchetypeId], references: [id])
  hobbies              ProfileHobbyTag[]
  answers              UserQuestionnaireAnswer[]

  @@map("user_profiles")
}

// Predefined Personality Archetypes Table
model PersonalityArchetype {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  traits      String[] // List of short trait keywords (e.g. ["Innovative", "Introvert"])
  imageUrl    String?  @map("image_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  profiles UserProfile[]

  @@map("personality_archetypes")
}

// Predefined Hobby Tags Table
model HobbyTag {
  id        String   @id @default(uuid())
  name      String   @unique
  category  String   // "PERSONALITY", "COMMUNICATION_STYLE", "SPORT", "PET", "FOOD"
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  profiles ProfileHobbyTag[]

  @@map("hobby_tags")
}

// Join Table for Profile & Hobbies (Many-to-Many)
model ProfileHobbyTag {
  profileId String @map("profile_id")
  tagId     String @map("tag_id")

  // Relations
  profile UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  tag     HobbyTag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([profileId, tagId])
  @@map("profile_hobby_tags")
}

// Predefined Questionnaire Questions Table
model QuestionnaireQuestion {
  id        String   @id @default(uuid())
  text      String
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  options QuestionnaireOption[]
  answers UserQuestionnaireAnswer[]

  @@map("questionnaire_questions")
}

// Predefined Options for Questions Table
model QuestionnaireOption {
  id         String   @id @default(uuid())
  questionId String   @map("question_id")
  text       String
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relations
  question QuestionnaireQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers  UserQuestionnaireAnswer[]

  @@map("questionnaire_options")
}

// User Submitted Answers
model UserQuestionnaireAnswer {
  id               String   @id @default(uuid())
  profileId        String   @map("profile_id")
  questionId       String   @map("question_id")
  selectedOptionId String   @map("selected_option_id")
  createdAt        DateTime @default(now()) @map("created_at")

  // Relations
  profile        UserProfile           @relation(fields: [profileId], references: [id], onDelete: Cascade)
  question       QuestionnaireQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedOption QuestionnaireOption   @relation(fields: [selectedOptionId], references: [id], onDelete: Cascade)

  @@unique([profileId, questionId])
  @@map("user_questionnaire_answers")
}
```

## Validation & Business Rules

### 1. Nickname
- **Type**: String
- **Format**: Must be alphanumeric, permitting standard spaces, hyphens, and underscores. No leading/trailing spaces or special code characters.
- **Length**: Between 2 and 30 characters.

### 2. Birthday
- **Type**: ISO Date
- **Range**: Must be in the past. Must be at least 18 years before current date (using UTC calculations to prevent time zone inconsistencies).

### 3. Hobby Tags
- **Rule**: Users MUST select between 3 and 10 tags.
- **Verification**: The API will ensure all provided `tagId`s exist in the `HobbyTag` dictionary before saving.

### 4. Questionnaire Answers
- **Rule**: Answers are submitted as an array of objects: `{ questionId: String, selectedOptionId: String }`.
- **Verification**: The API ensures that the selected option is linked to the specified question.
