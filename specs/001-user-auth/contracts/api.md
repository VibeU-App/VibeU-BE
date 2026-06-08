# API Contracts: User Authentication

**Feature**: User Authentication  
**Date**: 2026-06-08  
**Base Path**: `/api/v1/auth`

## Endpoints

### POST /api/v1/auth/register

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules**:
- `email`: Valid email format, unique in system
- `password`: Min 8 chars, uppercase, lowercase, number, special char

**Response (201 Created)**:
```json
{
  "metadata": {
    "timestamp": "2026-06-08T10:27:03Z",
    "path": "/api/v1/auth/register",
    "version": "1.0.0"
  },
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2026-06-08T10:27:03Z"
  },
  "statusCode": 201,
  "message": "User registered successfully"
}
```

**Errors**:
- `400 Bad Request`: Validation failed
- `409 Conflict`: Email already registered

---

### POST /api/v1/auth/login

Authenticate user and receive token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "metadata": {
    "timestamp": "2026-06-08T10:27:03Z",
    "path": "/api/v1/auth/login",
    "version": "1.0.0"
  },
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "user"
    }
  },
  "statusCode": 200,
  "message": "Login successful"
}
```

**Errors**:
- `401 Unauthorized`: Invalid credentials

---

### GET /api/v1/auth/profile

Get authenticated user profile. Requires valid JWT token.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "metadata": {
    "timestamp": "2026-06-08T10:27:03Z",
    "path": "/api/v1/auth/profile",
    "version": "1.0.0"
  },
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2026-06-08T10:27:03Z"
  },
  "statusCode": 200,
  "message": "Success"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token

---

### GET /api/v1/auth/admin/users

List all users. Requires admin role.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Decorator**: `@Roles('admin')`

**Response (200 OK)**:
```json
{
  "metadata": {
    "timestamp": "2026-06-08T10:27:03Z",
    "path": "/api/v1/auth/admin/users",
    "version": "1.0.0"
  },
  "data": [
    {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2026-06-08T10:27:03Z"
    }
  ],
  "statusCode": 200,
  "message": "Success"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User lacks required role

---

## Error Response Format

All errors follow the Envelope Pattern:

```json
{
  "metadata": {
    "timestamp": "2026-06-08T10:27:03Z",
    "path": "/api/v1/auth/login",
    "version": "1.0.0"
  },
  "data": null,
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

## Authentication Flow

1. User registers via `POST /register`
2. User logs in via `POST /login` → receives `accessToken`
3. User includes `accessToken` in `Authorization: Bearer <token>` header
4. Protected endpoints validate token and optionally check role
5. Role-based endpoints use `@Roles()` decorator + `RolesGuard`