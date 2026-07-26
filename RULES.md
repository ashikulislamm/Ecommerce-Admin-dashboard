# Project Rules

# Ecommerce Admin Dashboard

**Document:** Engineering & Development Rules
**Status:** Mandatory
**Applies To:** Frontend, Backend, Database, Infrastructure, Testing, Documentation

---

# 1. Purpose

This document defines the mandatory rules and engineering standards for the Ecommerce Admin Dashboard.

These rules exist to ensure that the project remains:

* Secure
* Maintainable
* Scalable
* Modular
* Consistent
* Testable
* Production-ready

All contributors and AI coding assistants working on this project must follow these rules.

If a new implementation conflicts with these rules, the implementation must be redesigned unless the rule is explicitly updated.

---

# 2. Core Engineering Principles

The project must follow these principles:

```text
Security First
        ↓
Correctness
        ↓
Data Integrity
        ↓
Maintainability
        ↓
Testability
        ↓
Performance
        ↓
Developer Experience
        ↓
UI Polish
```

Do not sacrifice security or data integrity for development speed.

Do not introduce complexity without a clear requirement.

Do not implement features outside the current scope without explicit approval.

---

# 3. Architecture Rules

## Rule 3.1 — Follow the Defined Architecture

The project must follow the architecture defined in:

```text
PRD.md
ARCHITECTURE.md
Phases.md
```

These documents are the primary project references.

If implementation requirements change, update the relevant documentation before significantly changing the architecture.

---

## Rule 3.2 — Use Modular Monolith Architecture

The backend must remain a modular monolith unless there is a documented architectural reason to change it.

Do not introduce microservices prematurely.

The system should be organized into business modules:

```text
auth
permissions
roles
users
media
categories
brands
attributes
products
```

---

## Rule 3.3 — Respect Module Boundaries

Each module must own its own:

* Routes
* Controllers
* Services
* Repositories
* Schemas
* Types

Example:

```text
modules/products/
├── product.controller.ts
├── product.service.ts
├── product.repository.ts
├── product.routes.ts
├── product.schema.ts
└── product.types.ts
```

Do not randomly place domain-specific logic in global utility folders.

---

## Rule 3.4 — Avoid Circular Dependencies

Modules must not create circular dependencies.

Avoid:

```text
Product
  ↓
Category
  ↓
Product
```

If two modules require shared functionality, extract only the truly shared abstraction.

Do not create unnecessary cross-module dependencies.

---

# 4. Backend Layer Rules

The backend request flow must follow:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

---

## Rule 4.1 — Routes Must Be Thin

Routes may define:

* HTTP method
* URL
* Middleware
* Controller

Routes must not contain:

* Business logic
* Database queries
* Complex validation
* Transaction logic

---

## Rule 4.2 — Controllers Must Be Thin

Controllers are responsible for:

1. Reading request data.
2. Calling the service layer.
3. Returning the response.

Controllers must not contain complex business rules.

Avoid:

```typescript
const user = await prisma.user.findUnique(...)
```

inside controllers.

Database access belongs in repositories.

---

## Rule 4.3 — Business Logic Belongs in Services

Business rules must be implemented in the service layer.

Examples:

```text
Create Product
Generate Variants
Validate Variant Combination
Assign Role Permissions
Rotate Refresh Token
Validate Category Hierarchy
```

Services may coordinate multiple repositories.

---

## Rule 4.4 — Database Access Belongs in Repositories

Repositories are responsible for database operations.

Do not access Prisma directly from:

* Controllers
* Routes
* Frontend
* UI components

Preferred:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
```

---

## Rule 4.5 — Avoid God Services

A service must not become a giant class containing unrelated business logic.

Bad:

```text
EcommerceService
├── Auth
├── Users
├── Roles
├── Products
├── Media
└── Categories
```

Preferred:

```text
AuthService
UserService
RoleService
ProductService
MediaService
CategoryService
```

---

# 5. Security Rules

Security is mandatory.

---

## Rule 5.1 — Backend Authorization Is Mandatory

Frontend permission checks are never considered security.

The backend must independently verify permissions.

A user calling an API through:

* Browser
* Postman
* cURL
* Custom scripts

must receive the same authorization result.

---

## Rule 5.2 — Never Trust the Frontend

Never trust:

* User IDs from frontend requests.
* Role IDs from frontend requests.
* Permission IDs from frontend requests.
* Product ownership assumptions.
* Client-side validation.
* Hidden UI elements.

All critical data must be validated server-side.

---

## Rule 5.3 — Authentication Before Authorization

Protected endpoints must follow:

```text
Authentication
    ↓
Authorization
    ↓
Validation
    ↓
Business Logic
```

Do not authorize an unauthenticated user.

---

## Rule 5.4 — Use 401 and 403 Correctly

Use:

```text
401 Unauthorized
```

when authentication is missing or invalid.

Use:

```text
403 Forbidden
```

when the user is authenticated but lacks permission.

Do not use `403` for missing authentication.

---

## Rule 5.5 — Never Store Plaintext Passwords

Passwords must always be hashed using a secure password hashing algorithm.

Never store:

```text
password
passwordHash = plaintext
```

The database must contain only the password hash.

---

## Rule 5.6 — Never Store Raw Refresh Tokens

Refresh tokens must never be stored in plaintext in the database.

Store:

```text
hash(refreshToken)
```

instead.

---

## Rule 5.7 — Refresh Tokens Must Be Rotated

Every successful refresh operation must:

```text
Old Refresh Token
        ↓
Revoke
        ↓
Generate New Refresh Token
        ↓
Store New Hash
        ↓
Return New Access Token
```

Old refresh tokens must not remain reusable.

---

## Rule 5.8 — Logout Must Revoke Sessions

Logout must invalidate the server-side refresh session.

Deleting a frontend cookie alone is not sufficient.

---

## Rule 5.9 — Inactive Users Must Be Blocked

Inactive users must not be able to:

* Login.
* Refresh sessions.
* Access protected resources.

This must be enforced by the backend.

---

## Rule 5.10 — Prevent Self-Privilege Escalation

A user must not be able to grant themselves higher privileges.

Users must not be able to:

* Change their own role.
* Assign themselves a privileged role.
* Grant themselves permissions.

unless explicitly authorized by a higher-level security policy.

---

## Rule 5.11 — Protect Secrets

Never commit:

```text
JWT secrets
Database passwords
API keys
Cloud credentials
Refresh tokens
Private keys
```

to Git.

Use environment variables.

---

## Rule 5.12 — Never Expose Sensitive Data

API responses must never expose:

* Password hashes.
* Refresh tokens.
* JWT secrets.
* Internal secrets.
* Database credentials.
* Sensitive infrastructure details.

---

# 6. Authentication Rules

## Rule 6.1 — Access Tokens Must Be Short-Lived

Access tokens should have a relatively short expiration time.

Refresh sessions should be used for longer-lived authentication.

---

## Rule 6.2 — Refresh Tokens Use HttpOnly Cookies

Refresh tokens should be stored in secure HttpOnly cookies.

Production cookies should use:

```text
HttpOnly
Secure
SameSite
```

with values appropriate for the deployment architecture.

---

## Rule 6.3 — Access Tokens Must Not Be Persisted Insecurely

Avoid storing long-lived access tokens in:

```text
localStorage
```

Prefer secure session strategies.

---

## Rule 6.4 — Refresh Requests Must Be Concurrency Safe

The frontend must not trigger multiple simultaneous refresh operations for the same expired session.

Use a shared refresh mechanism.

---

# 7. RBAC Rules

The authorization system must use:

```text
User
  ↓
Role
  ↓
RolePermission
  ↓
Permission
```

---

## Rule 7.1 — Permission Naming

Permissions must follow:

```text
module:action
```

Examples:

```text
product:create
product:read
product:update
product:delete

role:create
role:update

user:create
user:delete
```

---

## Rule 7.2 — Permissions Must Be Unique

Permission names must be unique.

The database must enforce this constraint.

---

## Rule 7.3 — Roles Must Be Unique

Role names must be unique.

Case normalization should be considered where appropriate.

---

## Rule 7.4 — Do Not Hardcode Role Names For Authorization

Do not use:

```typescript
if (user.role === "ADMIN")
```

as the primary authorization mechanism.

Use permissions:

```typescript
authorize("product:create")
```

Roles are permission containers.

---

## Rule 7.5 — Avoid Hardcoded Permission Lists

Do not duplicate permission lists throughout the codebase.

Use a centralized permission registry or database-driven permissions.

---

## Rule 7.6 — Permission Changes Must Take Effect Quickly

Do not rely exclusively on permissions embedded inside long-lived JWTs.

Authorization should be evaluated using current server-side permission data or a safe cache strategy.

---

# 8. Database Rules

The database is the final data integrity boundary.

---

## Rule 8.1 — Use PostgreSQL

PostgreSQL is the primary database.

Do not introduce another database engine without an explicit architectural decision.

---

## Rule 8.2 — Use Prisma

Prisma is the standard database access layer.

Do not mix multiple ORMs without a documented reason.

---

## Rule 8.3 — Use Database Constraints

Important rules must be enforced at the database level.

Examples:

```text
Unique Email
Unique SKU
Unique Slug
Unique Role Name
Unique Permission Name
```

Application validation alone is insufficient.

---

## Rule 8.4 — Use Foreign Keys

Relationships must use proper foreign keys.

Do not manually maintain relationships only through application logic.

---

## Rule 8.5 — Use Transactions For Multi-Step Operations

If multiple database operations must succeed together, use a transaction.

Example:

```text
Create Product
    ↓
Attach Categories
    ↓
Attach Media
    ↓
Create Variants
    ↓
Attach Attributes
```

All operations must succeed together.

---

## Rule 8.6 — Never Leave Partial Data

If a transaction fails:

```text
ROLLBACK
```

No incomplete product or variant structure should remain.

---

## Rule 8.7 — Do Not Delete Referenced Entities

Entities referenced by other records should not be blindly deleted.

Examples:

```text
Brand → referenced by Product
Category → referenced by Product
Attribute → referenced by Variant
Media → referenced by Product
```

Use:

* Restriction.
* Soft deletion.
* Safe reassignment.

based on the domain requirement.

---

## Rule 8.8 — Avoid Uncontrolled Cascading Deletes

Do not use cascading deletion without carefully evaluating data loss.

Cascade rules must be explicitly documented.

---

# 9. Validation Rules

All external input must be validated.

---

## Rule 9.1 — Validate Every External Input

Validate:

* Request body.
* Query parameters.
* Route parameters.
* File uploads.
* Headers where relevant.

---

## Rule 9.2 — Use Zod

Zod is the recommended validation library.

Schemas should be reusable where appropriate.

---

## Rule 9.3 — Validate Before Business Logic

The order must be:

```text
Request
  ↓
Validation
  ↓
Business Logic
```

Do not execute business logic with unvalidated data.

---

## Rule 9.4 — Never Trust Client-Side Validation

Frontend validation improves user experience.

Backend validation protects the system.

Both are required.

---

## Rule 9.5 — Validate Business Rules

Schema validation alone is insufficient.

Examples:

```text
Sale Price <= Regular Price
Stock >= 0
Price >= 0
Valid Category
Valid Brand
Valid Attribute Value
Unique Variant Combination
```

Business rules belong in the service layer.

---

# 10. Product Rules

---

## Rule 10.1 — SKU Must Be Unique

Every product or product variant requiring a SKU must have a unique SKU.

The database must enforce uniqueness.

---

## Rule 10.2 — Variant Combinations Must Be Unique

A variable product cannot contain duplicate combinations.

Example:

```text
Red + Medium
Red + Medium
```

must be rejected.

---

## Rule 10.3 — Variant Attributes Must Be Valid

A variant may only reference valid attribute values associated with the product's configured attributes.

---

## Rule 10.4 — Product Type Must Be Explicit

Products must clearly identify whether they are:

```text
SIMPLE
VARIABLE
```

Do not infer product type inconsistently from unrelated fields.

---

## Rule 10.5 — Variant Generation Must Be Deterministic

The same input attribute combinations must always produce the same combination set.

Variant generation should be implemented as a pure function where possible.

---

## Rule 10.6 — Variant Generator Must Not Persist Data

The variant generator should:

```text
Input
  ↓
Calculate Combinations
  ↓
Return Combinations
```

Persistence belongs to the service layer.

---

## Rule 10.7 — Product Creation Must Be Transactional

Creating a complex product must use a transaction.

---

## Rule 10.8 — Product Search Must Be Server-Side

Do not load thousands of products into the browser to perform filtering.

Use backend:

```text
Search
Filter
Sort
Pagination
```

---

# 11. Category Rules

## Rule 11.1 — Categories Support Hierarchy

Categories must support parent-child relationships.

---

## Rule 11.2 — Prevent Self-Parenting

A category cannot be its own parent.

---

## Rule 11.3 — Prevent Circular Relationships

The system must prevent:

```text
A
 ↓
B
 ↓
C
 ↓
A
```

---

## Rule 11.4 — Validate Parent Changes

When moving a category, verify that the new parent does not create a circular hierarchy.

---

## Rule 11.5 — Protect Referenced Categories

Do not delete categories that are:

* Used by child categories.
* Assigned to products.

unless a safe deletion/reassignment strategy exists.

---

# 12. Media Rules

## Rule 12.1 — Validate Uploads

Validate:

```text
MIME Type
Extension
File Size
Image Dimensions
```

---

## Rule 12.2 — Generate Server-Side Filenames

Never trust user-provided filenames as storage filenames.

---

## Rule 12.3 — Do Not Trust File Extensions

File content and MIME type must be validated.

---

## Rule 12.4 — Media Storage Must Be Abstracted

Business logic must not depend directly on:

```text
fs.writeFile()
```

Use a storage abstraction.

---

## Rule 12.5 — Media Must Be Reusable

The media library should support reuse across:

```text
Products
Variants
Categories
Brands
Attribute Values
```

---

## Rule 12.6 — Protect Referenced Media

Referenced media must not be deleted without handling the references safely.

---

# 13. API Rules

## Rule 13.1 — Use RESTful API Design

Follow standard HTTP semantics.

```text
GET
POST
PUT
PATCH
DELETE
```

Use the appropriate method for each operation.

---

## Rule 13.2 — Use API Versioning

All APIs must use:

```text
/api/v1
```

---

## Rule 13.3 — Use Consistent Responses

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": {
    "code": "ERROR_CODE"
  }
}
```

---

## Rule 13.4 — Use Meaningful HTTP Status Codes

Use:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

---

## Rule 13.5 — Never Return Internal Errors Directly

Do not expose raw:

```text
Prisma errors
Stack traces
Database errors
Filesystem paths
```

in production responses.

---

## Rule 13.6 — Use Centralized Error Handling

All unexpected errors must flow through the global error handler.

---

# 14. API Pagination Rules

All potentially large collection endpoints must support pagination.

Example:

```text
GET /products?page=1&limit=20
```

Response must include metadata.

```json
{
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

Do not return unlimited datasets by default.

---

# 15. API Query Rules

Query parameters must be validated.

Examples:

```text
page
limit
search
sort
order
status
category
brand
```

Reject invalid values rather than silently accepting unexpected input.

---

# 16. Frontend Rules

---

## Rule 16.1 — Follow Feature-Based Organization

Feature-specific code belongs inside:

```text
features/
```

Do not place all components in one massive global folder.

---

## Rule 16.2 — Reuse Shared Components

Common UI components should be reused.

Examples:

```text
Button
Input
Modal
Dialog
DataTable
Pagination
Select
Dropdown
Form
EmptyState
LoadingState
ErrorState
```

Do not duplicate identical components.

---

## Rule 16.3 — Do Not Over-Abstract

Do not create a generic component simply because two components look similar.

Abstract when:

* Behavior is genuinely shared.
* API is stable.
* Reuse improves maintainability.

---

## Rule 16.4 — Use TanStack Query For Server State

Server state should generally be managed through TanStack Query.

Do not duplicate server data unnecessarily in global state.

---

## Rule 16.5 — Avoid Global State For Local UI

Use local component state for:

* Modal visibility.
* Form state.
* Temporary selections.
* UI toggles.

Do not put everything into a global store.

---

## Rule 16.6 — Permission-Aware UI

Hide or disable UI actions when the user lacks permissions.

Examples:

```text
product:create
product:update
product:delete
```

But remember:

```text
UI restriction ≠ Security
```

---

## Rule 16.7 — Handle All UI States

Every data-driven page should handle:

```text
Loading
Success
Empty
Error
Unauthorized
Forbidden
```

Do not leave blank screens.

---

# 17. Forms Rules

Forms should use:

```text
React Hook Form
+
Zod
```

where appropriate.

---

## Rule 17.1 — Reuse Validation Schemas

Where frontend and backend schemas are compatible, consider sharing validation definitions.

However, backend validation must remain authoritative.

---

## Rule 17.2 — Show Field-Level Errors

Validation errors should appear close to the relevant field.

---

## Rule 17.3 — Prevent Duplicate Submissions

Disable or guard submission while a mutation is in progress.

---

## Rule 17.4 — Confirm Destructive Actions

Destructive actions such as deletion should require confirmation.

---

# 18. Data Fetching Rules

Use:

```text
TanStack Query
```

for server data.

Queries must support:

* Loading state.
* Error state.
* Cache invalidation.
* Refetching.
* Optimistic updates only when safe.

---

# 19. Performance Rules

## Rule 19.1 — Avoid N+1 Queries

Database queries must be reviewed for N+1 patterns.

---

## Rule 19.2 — Use Pagination

Never load large datasets unnecessarily.

---

## Rule 19.3 — Use Database Indexes

Frequently queried fields should be indexed.

Potential examples:

```text
email
slug
sku
status
createdAt
```

Index decisions must be based on actual query patterns.

---

## Rule 19.4 — Avoid Over-Fetching

Only query the data required by the operation.

---

## Rule 19.5 — Optimize Media

Large images should be processed and optimized.

Generate thumbnails where appropriate.

---

# 20. Logging Rules

Use structured logging.

Recommended:

```text
Pino
```

Log:

```text
Request ID
User ID
HTTP Method
Route
Status Code
Duration
Error Code
```

Never log:

```text
Passwords
Tokens
Secrets
Credentials
```

---

# 21. Error Handling Rules

All errors must use a consistent structure.

Recommended:

```text
AppError
├── statusCode
├── code
├── message
└── details
```

Do not use random error formats across modules.

---

# 22. Configuration Rules

All environment configuration must be centralized.

Example:

```text
config/env.ts
```

Environment variables must be validated during startup.

If a required environment variable is missing:

```text
Application Startup
        ↓
Configuration Validation
        ↓
Missing Required Value
        ↓
Fail Fast
```

Do not allow the application to start with invalid critical configuration.

---

# 23. Environment Rules

Supported environments:

```text
Development
Testing
Production
```

Never commit:

```text
.env
.env.production
```

Commit:

```text
.env.example
```

with placeholder values.

---

# 24. Code Quality Rules

## Rule 24.1 — Use TypeScript Strictly

Avoid:

```typescript
any
```

unless absolutely necessary.

If `any` is required, document why.

---

## Rule 24.2 — Avoid Type Assertions

Avoid unnecessary:

```typescript
as SomeType
```

Prefer proper type narrowing and validation.

---

## Rule 24.3 — No Dead Code

Remove:

* Unused functions.
* Unused imports.
* Unused variables.
* Commented-out old implementations.

---

## Rule 24.4 — No Duplicate Logic

If the same business rule exists in multiple locations, extract a reusable abstraction.

---

## Rule 24.5 — No Magic Strings

Avoid repeatedly writing:

```typescript
"product:create"
```

throughout the application.

Use centralized constants where appropriate.

---

## Rule 24.6 — Use Meaningful Names

Prefer:

```text
createProduct
validateVariantCombination
refreshSession
```

Avoid:

```text
doThing
processData
handleStuff
```

---

# 25. Naming Conventions

## Files

Use consistent naming.

Backend:

```text
product.service.ts
product.controller.ts
product.repository.ts
```

React components:

```text
ProductTable.tsx
ProductForm.tsx
```

---

## Variables

Use:

```text
camelCase
```

---

## Classes

Use:

```text
PascalCase
```

---

## Constants

Use:

```text
UPPER_SNAKE_CASE
```

when appropriate.

---

## Database

Use a consistent naming strategy across Prisma and PostgreSQL.

Do not mix naming conventions randomly.

---

# 26. Git Rules

## Rule 26.1 — Use Feature Branches

Examples:

```text
feature/authentication
feature/rbac
feature/product-management
fix/refresh-token
refactor/product-service
```

---

## Rule 26.2 — Keep Commits Focused

Avoid giant commits containing unrelated changes.

Prefer:

```text
feat(auth): implement login
feat(auth): implement refresh token rotation
test(auth): add login integration tests
```

---

## Rule 26.3 — Do Not Commit Broken Code

A branch should ideally:

* Build.
* Type-check.
* Pass relevant tests.

---

## Rule 26.4 — Do Not Commit Secrets

Before committing, verify:

```text
.env
credentials
tokens
keys
```

are excluded.

---

# 27. Testing Rules

Testing is mandatory for critical functionality.

---

## Rule 27.1 — Authentication Must Be Tested

Test:

```text
Valid Login
Invalid Password
Invalid User
Inactive User
Refresh Token
Token Rotation
Logout
Revoked Session
```

---

## Rule 27.2 — Authorization Must Be Tested

Test:

```text
No Token → 401
Invalid Token → 401
Missing Permission → 403
Valid Permission → Success
```

---

## Rule 27.3 — RBAC Must Be Tested Through API

Do not only test frontend visibility.

Direct HTTP requests must be tested.

---

## Rule 27.4 — Transactions Must Be Tested

Test rollback behavior.

Example:

```text
Create Product
    ↓
Variant Creation Fails
    ↓
Verify Product Does Not Exist
```

---

## Rule 27.5 — Test Business Rules

Examples:

```text
Duplicate SKU
Duplicate Variant
Invalid Category
Circular Category
Invalid Sale Price
Negative Stock
```

---

# 28. Documentation Rules

Every major feature must have documentation.

Documentation should explain:

```text
Purpose
Architecture
API
Business Rules
Edge Cases
Testing
```

---

## Rule 28.1 — Keep Documentation Updated

When architecture changes, update:

```text
ARCHITECTURE.md
```

When product requirements change, update:

```text
PRD.md
```

When implementation phases change, update:

```text
Phases.md
```

When development rules change, update:

```text
RULES.md
```

---

# 29. AI Coding Assistant Rules

AI coding assistants must follow all project documentation.

Before implementing a feature, the AI should consider:

```text
PRD.md
ARCHITECTURE.md
Phases.md
RULES.md
```

---

## Rule 29.1 — Do Not Rewrite Unrelated Code

When implementing a feature:

```text
Modify only necessary files.
```

Do not refactor unrelated modules unless explicitly requested.

---

## Rule 29.2 — Do Not Introduce Unrequested Features

Do not add:

```text
AI
Microservices
Redis
Message Queues
Elasticsearch
Complex Caching
```

unless explicitly required.

---

## Rule 29.3 — Do Not Change Architecture Without Approval

Do not replace:

```text
Express → NestJS
Prisma → TypeORM
PostgreSQL → MongoDB
REST → GraphQL
```

without an explicit architectural decision.

---

## Rule 29.4 — Follow Existing Patterns

When adding a new module:

```text
Copy architectural pattern
        ↓
Adapt domain logic
        ↓
Do not invent a new structure
```

Consistency is more important than individual implementation preference.

---

## Rule 29.5 — Explain Architectural Deviations

If an implementation cannot follow the documented architecture, clearly explain:

```text
What changed
Why it changed
What alternatives were considered
What impact it has
```

---

## Rule 29.6 — Never Bypass Security For Convenience

AI-generated code must never:

* Disable authorization.
* Skip validation.
* Expose secrets.
* Store plaintext passwords.
* Trust client input.
* Bypass database constraints.

---

## Rule 29.7 — Never Use Fake Implementations

Do not create fake:

```text
API responses
Authentication
Authorization
Database operations
```

unless explicitly writing tests or mocks.

---

# 30. Feature Implementation Rules

Every feature should follow this process:

```text
1. Understand Requirement
        ↓
2. Review Architecture
        ↓
3. Review Existing Code
        ↓
4. Identify Dependencies
        ↓
5. Design Data Changes
        ↓
6. Implement Backend
        ↓
7. Implement Validation
        ↓
8. Implement Authorization
        ↓
9. Write Tests
        ↓
10. Implement Frontend
        ↓
11. Integrate
        ↓
12. Test End-to-End
        ↓
13. Update Documentation
```

---

# 31. Definition of Done

A feature is not complete until:

```text
[ ] Requirement implemented
[ ] Database changes complete
[ ] Validation implemented
[ ] Authorization implemented
[ ] Error handling implemented
[ ] API implemented
[ ] Frontend implemented
[ ] Loading state handled
[ ] Empty state handled
[ ] Error state handled
[ ] Unauthorized state handled
[ ] Tests added
[ ] Existing tests pass
[ ] Type checking passes
[ ] Lint passes
[ ] Documentation updated
```

---

# 32. Forbidden Practices

The following practices are prohibited.

```text
❌ Plaintext passwords
❌ Raw refresh tokens in database
❌ Authorization only on frontend
❌ Direct Prisma calls from controllers
❌ Business logic inside routes
❌ Unvalidated API input
❌ Trusting client-provided roles
❌ Hardcoded admin bypasses
❌ Committing secrets
❌ Returning stack traces in production
❌ Loading entire datasets for client-side filtering
❌ Uncontrolled cascading deletes
❌ Duplicate business logic
❌ Giant God services
❌ Giant God components
❌ Unnecessary global state
❌ Premature microservices
❌ Unrequested features
❌ Fake API implementations
❌ Ignoring failing tests
```

---

# 33. Priority Rules

When rules conflict, use this priority:

```text
1. Security
2. Data Integrity
3. Correctness
4. Architecture
5. Maintainability
6. Performance
7. Developer Experience
8. UI Convenience
```

For example:

If a UI shortcut conflicts with backend security:

```text
Security Wins
```

If performance optimization risks data integrity:

```text
Data Integrity Wins
```

If a quick implementation violates architecture:

```text
Architecture Wins
```

---

# 34. Final Engineering Rule

The most important rule of this project is:

> **Do not make the code merely work. Make it work correctly within the architecture.**

Every implementation should be evaluated using:

```text
Does it satisfy the PRD?
        ↓
Does it follow the Architecture?
        ↓
Does it follow the Implementation Phases?
        ↓
Does it follow these Rules?
        ↓
Is it secure?
        ↓
Is the data consistent?
        ↓
Is it testable?
        ↓
Is it maintainable?
        ↓
Is it production-ready?
```

The goal is not to build the fastest possible prototype.

The goal is to build a system that can evolve from:

```text
Ecommerce Admin Dashboard
```

into:

```text
Complete Ecommerce Operations Platform
```

without requiring a complete rewrite of the foundation.
