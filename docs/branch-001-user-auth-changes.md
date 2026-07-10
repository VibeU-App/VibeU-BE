# Branch 001-user-auth - Changes Summary

## Overview

This branch implements the foundational architecture for the VibeU backend, including:
- Clean architecture with clear separation of concerns
- Service layer abstractions
- Database setup with Prisma ORM
- Email templating system
- Response envelope pattern
- Token service for authentication

## Architecture Changes

### Project Structure (Before → After)

```
src/
├── configuration/
│   └── config.ts              # NEW - Centralized config from .env
│
├── controllers/
│   └── auth.controller.ts     # REWRITTEN - Typed DTOs, Envelope responses
│
├── core/
│   ├── dtos/auth/             # NEW - Request/Response DTOs
│   ├── entities/
│   │   ├── user.entity.ts     # UPDATED - Added AccountStatus, soft deletes
│   │   ├── session.entity.ts  # NEW - Refresh token entity
│   │   └── otp.entity.ts      # NEW - OTP entity
│   ├── envelope/              # NEW - Response envelope pattern
│   └── errors/
│       └── app-exception.ts   # UPDATED - Simplified, error codes
│
├── frameworks/database/
│   ├── prisma/                # NEW - Prisma connection layer
│   │   ├── prisma.service.ts
│   │   ├── prisma.module.ts
│   │   └── prisma-cache.extension.ts
│   └── postgres/              # NEW - Repository implementations
│       ├── postgres.module.ts
│       ├── user.repository.ts
│       ├── cached-user.repository.ts
│       ├── session.repository.ts
│       └── account-status-loader.service.ts
│
├── services/
│   ├── crypto/                # NEW - Password hashing (argon2)
│   │   ├── crypto.interface.ts
│   │   └── argon2.service.ts
│   ├── token/                 # NEW - Token generation
│   │   ├── jwt.service.ts
│   │   └── token.service.ts
│   ├── mail/                  # NEW - Email sending
│   │   ├── mail.interface.ts
│   │   └── smtp.service.ts
│   └── template/              # NEW - Email template loader
│       └── template-loader.service.ts
│
├── middleware/                # FLATTENED - Removed domain subfolders
│   ├── auth.middleware.ts
│   ├── roles.guard.ts
│   └── roles.decorator.ts
│
└── use-cases/auth/
    ├── test-mocks.ts          # NEW - Consolidated test mocks
    └── *.usecase.ts           # UPDATED - Use new service interfaces
```

## Key Changes

### 1. Service Layer Abstractions

**Before:** Interfaces scattered in `src/use-cases/auth/`
**After:** Services in `src/services/` with interfaces co-located

| Service | Interface | Implementation |
|---------|-----------|----------------|
| Crypto | `ICryptoService` | `Argon2Service` (argon2id) |
| Token | `ITokenService` | `TokenService` (JWT + opaque) |
| Mail | `IMailService` | `SmtpMailService` |
| Template | - | `TemplateLoaderService` |

### 2. Password Hashing: bcrypt → argon2

**Why argon2id:**
- Memory-hard (resistant to GPU attacks)
- Side-channel resistant
- Winner of Password Hashing Competition

**Configuration:**
```typescript
{
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4,
}
```

### 3. Token Service

**Access Token (JWT):**
- Short-lived (15 minutes)
- Contains: user ID, email, role
- Stateless verification (no DB lookup)

**Refresh Token (Opaque):**
- 128-character hex string (64 random bytes)
- Long-lived (7 days)
- Stored in database for revocation
- Used to get new access tokens

### 4. Database Layer (Prisma + PostgreSQL)

**Prisma Schema:**
- `AccountStatus` - Lookup table (PENDING, ACTIVE, INACTIVE, TERMINATED)
- `User` - User accounts with soft deletes
- `Session` - Refresh tokens with soft deletes
- `Otp` - One-time passwords for verification

**Repository Pattern:**
- `IUserRepository` → `PrismaUserRepository` → `CachedUserRepository`
- `ISessionRepository` → `PrismaSessionRepository`

**In-Memory Cache:**
- `QueryCache` class with TTL support (default 5 minutes)
- Cached null results for 1 minute
- Cache invalidation on writes

**Account Status Loader:**
- Loads all statuses into HashMap at startup
- O(1) lookup by name or ID
- No DB queries for status lookups

### 5. Response Envelope Pattern

All responses wrapped in consistent structure:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "metadata": null
}
```

**Implementation:**
- `EnvelopeInterceptor` - Wraps successful responses
- `EnvelopeExceptionFilter` - Wraps errors

### 6. Email Templates

**Location:** `templates/emails/`

**Templates:**
- `otp-verification.html` - Registration OTP
- `password-reset.html` - Password reset OTP
- `welcome.html` - Welcome email

**Features:**
- Loaded into RAM at startup (not read from disk per send)
- Primary color: `#E11D48`
- Responsive design (600px breakpoint)
- `{{variable}}` interpolation

### 7. Configuration

**Centralized in `src/configuration/config.ts`:**
```typescript
export const config = {
  jwt: { secretKey: '...' },
  smtp: { host, port, user, pass },
  database: { connectionString },
};
```

### 8. DTOs (Request/Response)

**Location:** `src/core/dtos/auth/`

| File | Request DTO | Response DTO |
|------|-------------|--------------|
| `login.dto.ts` | `LoginRequestDto` | `LoginResponseDto` |
| `register.dto.ts` | `RegisterRequestDto` | `RegisterResponseDto` |
| `verify-registration.dto.ts` | `VerifyRegistrationRequestDto` | `VerifyRegistrationResponseDto` |
| `forgot-password.dto.ts` | `ForgotPasswordRequestDto` | `ForgotPasswordResponseDto` |
| `verify-otp.dto.ts` | `VerifyOtpRequestDto` | `VerifyOtpResponseDto` |
| `reset-password.dto.ts` | `ResetPasswordRequestDto` | `ResetPasswordResponseDto` |

## Dependencies Added

```json
{
  "argon2": "^0.44.0",
  "@prisma/client": "^7.8.0",
  "prisma": "^7.8.0",
  "dotenv": "^17.4.2",
  "nodemailer": "^8.0.11"
}
```

## Files Removed

- `src/dtos/auth/` - Moved to `src/core/dtos/auth/`
- `src/middleware/auth/` - Flattened to `src/middleware/`
- `src/use-cases/auth/mock-*.ts` - Consolidated into `test-mocks.ts`
- `src/use-cases/auth/*-service.interface.ts` - Moved to `src/services/`
- `src/use-cases/auth/account-status-repository.interface.ts` - Replaced by `AccountStatusLoaderService`

## Testing

**Test Mocks:** `src/use-cases/auth/test-mocks.ts`
- `MockCryptoService`
- `MockJwtService`
- `MockTokenService`
- `MockMailService`
- `MockUserRepository`
- `MockOtpRepository`
- `MockSessionRepository`

**Note:** Use-cases remain unimplemented (`throw new Error('Not implemented')`). BE devs will implement the logic.

## Environment Variables

Required in `.env`:
```env
JWT_SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
DATABASE_URL=postgresql://user:pass@localhost:5432/vibeu
```

## Migration

**SQL Migration:** `migrations/001_initial_schema/migration.sql`
- Creates `account_statuses` table with seed data
- Creates `users`, `sessions`, `otps` tables
- Sets up indexes for soft deletes

**Prisma:**
```bash
npx prisma migrate dev    # Apply migration
npx prisma generate       # Generate client
```

## Next Steps for BE Devs

1. Implement use-cases in `src/use-cases/auth/*.usecase.ts`
2. Implement controller logic in `src/controllers/auth.controller.ts`
3. Run `npx prisma migrate dev` to apply schema
4. Seed database with account statuses
5. Update `.env` with real credentials
