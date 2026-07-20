# Data Model: User Profile 'Me' Management

This document details the database schema additions and modifications required for Profile Dashboard and details editing.

## Prisma Database Schema Updates

### 1. Update Existing UserProfile Model
We will add the nullable `bio` column to store a short self-description:

```prisma
model UserProfile {
  // Existing fields...
  bio       String?   @db.VarChar(150)
}
```

## Validation & Business Rules

### 1. Biography (Bio)
- **Type**: String
- **Length**: Maximum 150 characters. Can be null or empty.

### 2. Nickname
- **Constraint**: Must follow initial profiling rules (alphanumeric, length 2 to 30 characters).

### 3. Birthday
- **Constraint**: Age must remain $\ge 18$ years. Calculates dynamic age and zodiac on retrieval.
