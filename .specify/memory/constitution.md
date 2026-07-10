# [Project_Name] Backend Constitution (NestJS)

This Constitution defines the immutable engineering laws, architectural boundaries, and coding standards for the NestJS backend[cite: 1]. It serves as the absolute source of truth for Spec-Driven Development[cite: 1]. All AI-generated specifications, plans, and implementations MUST strictly adhere to these rules[cite: 1].

## Core Architectural Principles

### 1. Hexagonal Clean Architecture (Module-Based)
The backend MUST strictly follow a hybrid Clean/Hexagonal Architecture, mapped to NestJS modules[cite: 1]. Every feature MUST be isolated within its own module directory and contain the following strict layer separation[cite: 1]:
* **domain/:** Contains ONLY pure business logic and core Entities (e.g., `UserEntity`). NO framework code, NO interfaces.
* **application/:** Contains Use Cases (Services) AND the **Repository Interfaces** (Ports). The service layer defines the exact contracts it needs to fetch or save data.
* **infrastructure/:** Contains concrete implementations of the Repository Interfaces (e.g., `UserRepositoryImpl` using TypeORM/Prisma), database models, and external API adapters[cite: 1].
* **presentation/:** Contains NestJS Controllers, DTOs (Data Transfer Objects), and Guards/Interceptors specific to the feature[cite: 1].

### 2. The Dependency & Repository Rule
* The Application layer MUST NOT know about the database. It must strictly program against the Repository Interfaces it defined.
* Dependency Injection (via NestJS custom providers) MUST be used to inject the Infrastructure's concrete repository into the Application's Use Cases using the interface token.

## Response Formatting & Error Handling

### 3. The Envelope Pattern
Every single HTTP response sent to the frontend MUST strictly follow the Envelope Pattern[cite: 1]. Controllers must never return raw data[cite: 1]. All responses must be formatted using a global NestJS Interceptor[cite: 1].
The standard JSON response structure MUST be[cite: 1]:
{  
  "metadata": {  
    "timestamp": "2026-06-08T10:27:03Z",  
    "path": "/api/v1/auth/login",  
    "version": "1.0.0"  
  },  
  "data": { ... }, 
  "statusCode": 200, 
  "message": "Success" 
}

### 4. Centralized Error Handling
Exceptions MUST be handled globally using a NestJS Exception Filter[cite: 1]. The Application and Domain layers should throw standard HTTP exceptions (or custom domain exceptions mapped to HTTP exceptions)[cite: 1]. The global filter MUST catch these and format them into the Envelope Pattern[cite: 1].

## Test-Driven Development (TDD) & Mocking

### 5. Repository Mocking Rule
When writing unit tests for the Application layer (Services/Use Cases), developers MUST NEVER connect to a real database. You MUST create a mock class that implements the Repository Interface defined in the Application layer, and inject that mock into the Service.

### 6. Pure TypeScript Testing
Unit tests for the `application/` layer MUST NOT import `@nestjs/testing`. They must be pure TypeScript tests (Jest/Vitest) that instantiate the Service classes directly with the mocked repositories. 

## Coding Standards
* **Validation:** All incoming requests MUST be validated using NestJS `ValidationPipe` and `class-validator` DTOs[cite: 1].
* **Type Safety:** Strict TypeScript is required. `any` types are strictly forbidden[cite: 1].