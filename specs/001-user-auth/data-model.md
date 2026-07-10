# Data Model: User Authentication

**Feature**: User Authentication  
**Date**: 2026-06-08

## Entities

### UserEntity (Domain Layer)

Pure TypeScript class representing business user logic.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `email`: string - User's email address
- `passwordHash`: string - Hashed password
- `role`: UserRole - User's role (enum: 'user', 'admin')
- `createdAt`: Date - Account creation timestamp
- `updatedAt`: Date - Last update timestamp

**Business Rules**:
- Email must be unique in the system
- Password hash must never be exposed outside domain layer
- Role determines endpoint access permissions

---

### UserModel (Infrastructure Layer - TypeORM)

Database model for persistence.

**Table**: `users`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Indexes**:
- `IDX_users_email` on `email` (unique)

---

## Value Objects

### UserRole

Enum representing user roles.

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
```

---

### AuthenticationToken

JWT token structure.

**Payload**:
- `sub`: string - User ID (subject)
- `email`: string - User email
- `role`: UserRole - User role
- `iat`: number - Issued at timestamp
- `exp`: number - Expiration timestamp

---

## Relationships

- User has one role (UserRole enum)
- User has one password hash
- Authentication Token references User via `sub` claim

---

## State Transitions

### User Registration
```
[No User] → [User with role='user']
```

### Role Assignment (Admin only)
```
[User with role='user'] → [User with role='admin']
```

---

## Validation Rules

### Email
- Must be valid email format
- Must be unique in database
- Case-insensitive storage (lowercase)

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Role
- Must be valid UserRole enum value
- Default to 'user' if not specified