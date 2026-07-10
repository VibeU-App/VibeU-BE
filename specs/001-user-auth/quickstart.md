# Quickstart: User Authentication

**Feature**: User Authentication  
**Date**: 2026-06-08

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running with database created
- NestJS dependencies installed (`pnpm install`)

## Setup Steps

### 1. Environment Variables

Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vibeu
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=24h
```

### 2. Run Database Migrations

```bash
pnpm run typeorm:migration:run
```

### 3. Start Application

```bash
pnpm run start:dev
```

Application runs on `http://localhost:3000`

---

## Validation Scenarios

### Scenario 1: User Registration

**Test**: Register new user with valid credentials

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Expected Result**: 201 Created with user data (no password hash exposed)

---

### Scenario 2: Duplicate Registration

**Test**: Attempt registration with existing email

```bash
# Register first time
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Register again with same email
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Expected Result**: Second request returns 409 Conflict

---

### Scenario 3: User Login

**Test**: Login with valid credentials

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Expected Result**: 200 OK with accessToken

---

### Scenario 4: Access Protected Endpoint

**Test**: Access profile with valid token

```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' | jq -r '.data.accessToken')

# Access profile
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**: 200 OK with user profile data

---

### Scenario 5: Invalid Token

**Test**: Access protected endpoint with invalid token

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer invalid-token"
```

**Expected Result**: 401 Unauthorized

---

### Scenario 6: Role-Based Access (Admin Only)

**Test**: Access admin endpoint with non-admin user

```bash
# Login as regular user
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' | jq -r '.data.accessToken')

# Try admin endpoint
curl -X GET http://localhost:3000/api/v1/auth/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**: 403 Forbidden

---

## Unit Tests

Run unit tests for AuthService:

```bash
pnpm test -- --testPathPattern=auth.service.spec
```

**Expected**: All tests pass with mocked IUserRepository

---

## Integration Tests

Run e2e tests:

```bash
pnpm test:e2e
```

**Expected**: All endpoint tests pass

---

## Performance Validation

- Token validation: <100ms response time
- Role verification: <50ms response time
- Registration: <500ms including password hashing

---

## References

- [API Contracts](./contracts/api.md) - Full endpoint documentation
- [Data Model](./data-model.md) - Entity and schema details