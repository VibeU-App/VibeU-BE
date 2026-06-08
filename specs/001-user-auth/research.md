# Research: User Authentication

**Feature**: User Authentication  
**Date**: 2026-06-08  
**Status**: Complete

## Research Tasks

### 1. Password Hashing Strategy

**Decision**: Use bcrypt for password hashing

**Rationale**:
- Industry standard for password hashing
- Built-in salt generation
- Adaptive cost factor for future security improvements
- Well-supported in Node.js ecosystem

**Alternatives Considered**:
- argon2: More secure but heavier, overkill for standard web auth
- scrypt: Good alternative but less ecosystem support
- PBKDF2: Older standard, bcrypt preferred

---

### 2. JWT Token Structure

**Decision**: Use JSON Web Tokens with role embedded in payload

**Rationale**:
- Stateless authentication
- Role can be verified without database lookup
- Standard format with wide library support
- Can include expiration and issuer claims

**Token Payload Structure**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1717833600,
  "exp": 1717920000
}
```

**Alternatives Considered**:
- Opaque tokens with Redis session store: Requires state management
- PASETO: More secure but less ecosystem support
- Session cookies: Not suitable for API-first architecture

---

### 3. Role-Based Access Control Pattern

**Decision**: Use NestJS Guards with custom decorator for role verification

**Rationale**:
- Aligns with NestJS patterns
- Middleware intercepts request, reads role from JWT
- Decorator-based endpoint configuration is clean and declarative
- Guard can be applied at controller or method level

**Implementation Pattern**:
- `@Roles('admin')` decorator on endpoints
- `RolesGuard` reads role from validated JWT
- Guard compares required role with user's role

**Alternatives Considered**:
- ACL tables: More complex, requires database lookup per request
- Policy-based: Over-engineered for current scope

---

### 4. Database ORM Choice

**Decision**: Use TypeORM for database operations

**Rationale**:
- Mature NestJS integration
- Supports PostgreSQL well
- Repository pattern aligns with hexagonal architecture
- Migration support for schema management

**Alternatives Considered**:
- Prisma: Good alternative but different repository pattern
- Sequelize: Less NestJS-native integration
- Raw SQL: Too low-level for this scope

---

### 5. Validation Strategy

**Decision**: Use class-validator with class-transformer for DTO validation

**Rationale**:
- Official NestJS recommendation
- Decorator-based validation is clean
- Integrates with ValidationPipe
- Type-safe with TypeScript

**Validation Rules**:
- Email: `@IsEmail()` format validation
- Password: `@MinLength(8)`, `@Matches()` for complexity
- All DTOs validated automatically via global ValidationPipe

---

## Summary

All technical decisions have been made. No unresolved clarifications remain. The implementation can proceed with:
- bcrypt for password hashing
- JWT with role in payload
- NestJS Guards + custom decorator for RBAC
- TypeORM for database
- class-validator for DTO validation