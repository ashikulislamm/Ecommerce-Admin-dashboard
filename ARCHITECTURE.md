# Architecture Document

# Ecommerce Admin Dashboard

**Project:** Ecommerce Admin Dashboard
**Document:** Architecture Specification
**Status:** Planned / In Development
**Architecture Style:** Modular Monolith
**Primary Pattern:** Layered Architecture with Domain-Oriented Modules
**Frontend:** Next.js
**Backend:** Node.js + Express + TypeScript
**Database:** PostgreSQL
**ORM:** Prisma

---

# 1. Architecture Overview

The Ecommerce Admin Dashboard will be implemented as a **modular monolith** consisting of two primary applications:

```text
Ecommerce Admin Dashboard
│
├── Web Application
│   └── Next.js
│
└── API Application
    └── Node.js + Express + TypeScript
        │
        ├── Authentication
        ├── Authorization
        ├── Permission
        ├── Role
        ├── User
        ├── Media
        ├── Category
        ├── Brand
        ├── Attribute
        └── Product
```

The system will use a single PostgreSQL database with Prisma as the database access layer.

The architecture is intentionally designed as a **modular monolith rather than microservices**.

This provides:

* Faster development.
* Lower infrastructure complexity.
* Easier local development.
* Strong transactional consistency.
* Easier database relationships.
* Clear module boundaries.
* A future migration path to services if required.

---

# 2. High-Level System Architecture

```text
                         ┌───────────────────────┐
                         │       Admin User      │
                         └───────────┬───────────┘
                                     │
                                     │ HTTPS
                                     ▼
                         ┌───────────────────────┐
                         │    Next.js Web App    │
                         │                       │
                         │  UI + State + Query   │
                         └───────────┬───────────┘
                                     │
                                     │ REST API
                                     ▼
                         ┌───────────────────────┐
                         │    Express API        │
                         │                       │
                         │ Authentication        │
                         │ Authorization         │
                         │ Validation             │
                         │ Business Logic         │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
             ┌────────────┐   ┌────────────┐   ┌────────────┐
             │ PostgreSQL │   │ File Store │   │   Logger   │
             │ + Prisma   │   │ / Storage  │   │   Pino     │
             └────────────┘   └────────────┘   └────────────┘
```

---

# 3. Architectural Style

The application will use a **modular monolithic architecture with layered separation of concerns**.

Each domain module will be independently organized.

Example:

```text
Product Module
│
├── Route
├── Controller
├── Service
├── Repository
├── Schema
├── Types
└── Mapper
```

The standard request flow will be:

```text
HTTP Request
     │
     ▼
Route
     │
     ▼
Authentication Middleware
     │
     ▼
Authorization Middleware
     │
     ▼
Validation Middleware
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
Prisma
     │
     ▼
PostgreSQL
```

The response flows in reverse:

```text
PostgreSQL
     │
     ▼
Prisma
     │
     ▼
Repository
     │
     ▼
Service
     │
     ▼
Controller
     │
     ▼
Response Mapper
     │
     ▼
HTTP Response
```

---

# 4. Why Modular Monolith

The project requires strong relationships between:

```text
Users
Roles
Permissions
Products
Categories
Brands
Attributes
Variants
Media
```

These relationships frequently require database transactions.

A modular monolith allows:

* Single database transactions.
* Strong foreign key constraints.
* Simple deployment.
* Lower operational overhead.
* Easier development.

The system should not be prematurely split into microservices.

Future services can be extracted if the system grows significantly.

Potential future services:

```text
Identity Service
Catalog Service
Media Service
Inventory Service
Order Service
Notification Service
Analytics Service
```

---

# 5. Repository Architecture

The recommended repository structure is:

```text
ecommerce-admin-dashboard/
│
├── apps/
│   │
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── public/
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── core/
│       │   ├── middlewares/
│       │   ├── modules/
│       │   ├── routes/
│       │   ├── lib/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       │
│       └── tests/
│
├── packages/
│   ├── shared/
│   ├── types/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── Phases.md
│   └── API.md
│
├── scripts/
│
├── docker/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
├── .gitignore
└── README.md
```

---

# 6. Backend Architecture

The backend will be organized around business modules.

```text
apps/api/src/modules/
│
├── auth/
├── permissions/
├── roles/
├── users/
├── media/
├── categories/
├── brands/
├── attributes/
└── products/
```

Each module owns its own business logic.

---

# 7. Backend Folder Structure

Recommended structure:

```text
apps/api/src/
│
├── config/
│   ├── env.ts
│   ├── database.ts
│   ├── auth.ts
│   ├── cors.ts
│   ├── logger.ts
│   └── upload.ts
│
├── core/
│   ├── errors/
│   │   ├── AppError.ts
│   │   ├── ErrorCodes.ts
│   │   └── errorHandler.ts
│   │
│   ├── responses/
│   │   ├── ApiResponse.ts
│   │   └── Pagination.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── pagination.types.ts
│   │   └── request.types.ts
│   │
│   └── constants/
│       ├── permissions.ts
│       └── roles.ts
│
├── middlewares/
│   ├── authenticate.ts
│   ├── authorize.ts
│   ├── validate.ts
│   ├── errorHandler.ts
│   ├── notFound.ts
│   ├── requestId.ts
│   ├── rateLimiter.ts
│   └── upload.ts
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   ├── auth.types.ts
│   │   └── auth.mapper.ts
│   │
│   ├── permissions/
│   │   ├── permission.controller.ts
│   │   ├── permission.service.ts
│   │   ├── permission.repository.ts
│   │   ├── permission.routes.ts
│   │   ├── permission.schema.ts
│   │   └── permission.types.ts
│   │
│   ├── roles/
│   │   ├── role.controller.ts
│   │   ├── role.service.ts
│   │   ├── role.repository.ts
│   │   ├── role.routes.ts
│   │   ├── role.schema.ts
│   │   └── role.types.ts
│   │
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.routes.ts
│   │   ├── user.schema.ts
│   │   └── user.types.ts
│   │
│   ├── media/
│   │   ├── media.controller.ts
│   │   ├── media.service.ts
│   │   ├── media.repository.ts
│   │   ├── media.routes.ts
│   │   ├── media.schema.ts
│   │   ├── media.storage.ts
│   │   └── media.types.ts
│   │
│   ├── categories/
│   │   ├── category.controller.ts
│   │   ├── category.service.ts
│   │   ├── category.repository.ts
│   │   ├── category.routes.ts
│   │   ├── category.schema.ts
│   │   └── category.types.ts
│   │
│   ├── brands/
│   │   ├── brand.controller.ts
│   │   ├── brand.service.ts
│   │   ├── brand.repository.ts
│   │   ├── brand.routes.ts
│   │   ├── brand.schema.ts
│   │   └── brand.types.ts
│   │
│   ├── attributes/
│   │   ├── attribute.controller.ts
│   │   ├── attribute.service.ts
│   │   ├── attribute.repository.ts
│   │   ├── attribute.routes.ts
│   │   ├── attribute.schema.ts
│   │   └── attribute.types.ts
│   │
│   └── products/
│       ├── product.controller.ts
│       ├── product.service.ts
│       ├── product.repository.ts
│       ├── product.routes.ts
│       ├── product.schema.ts
│       ├── product.types.ts
│       ├── product.mapper.ts
│       ├── variant.service.ts
│       └── variant.generator.ts
│
├── lib/
│   ├── prisma.ts
│   ├── jwt.ts
│   ├── password.ts
│   ├── cookies.ts
│   └── storage.ts
│
├── utils/
│   ├── slug.ts
│   ├── pagination.ts
│   ├── queryParser.ts
│   └── asyncHandler.ts
│
├── routes/
│   └── index.ts
│
├── app.ts
└── server.ts
```

---

# 8. Layer Responsibilities

## 8.1 Route Layer

Responsible for:

* Defining endpoints.
* Applying middleware.
* Connecting routes to controllers.

Routes should not contain business logic.

Example:

```text
POST /products
        ↓
authenticate
        ↓
authorize(product:create)
        ↓
validate(createProductSchema)
        ↓
productController.create
```

---

## 8.2 Controller Layer

Responsible for:

* Reading HTTP request.
* Calling service.
* Returning HTTP response.

Controllers should be thin.

Avoid:

```text
Database queries
Complex business rules
Authorization logic
```

inside controllers.

---

## 8.3 Service Layer

The service layer contains business logic.

Examples:

```text
Create Product
Generate Variants
Validate Category Hierarchy
Assign Role Permissions
Rotate Refresh Token
```

The service layer may coordinate multiple repositories.

---

## 8.4 Repository Layer

Repositories are responsible for database operations.

Examples:

```text
findUserByEmail()
createUser()
findProductById()
createProduct()
```

The repository layer should not contain HTTP logic.

---

## 8.5 Schema Layer

The schema layer validates external input.

Examples:

```text
LoginSchema
CreateUserSchema
CreateRoleSchema
CreateProductSchema
CreateVariantSchema
```

Zod is recommended.

---

# 9. Authentication Architecture

The authentication system uses:

```text
Short-lived Access Token
+
Long-lived Refresh Token
```

Architecture:

```text
                 Login
                   │
                   ▼
           Validate Credentials
                   │
                   ▼
             Password Check
                   │
                   ▼
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
 Access Token           Refresh Token
       │                       │
       │                       ▼
       │               HttpOnly Cookie
       │                       │
       │                       ▼
       │                Hashed in DB
       │
       ▼
 Authorization Header
```

---

# 10. Refresh Token Session Model

A `RefreshSession` record should represent a server-side refresh session.

Conceptually:

```text
RefreshSession
│
├── id
├── userId
├── tokenHash
├── expiresAt
├── revokedAt
├── createdAt
└── updatedAt
```

The database must never store the raw refresh token.

---

# 11. Authentication Request Flow

```text
Client
  │
  │ POST /auth/login
  ▼
Auth Controller
  │
  ▼
Auth Service
  │
  ├── Find User
  ├── Check Active
  ├── Verify Password
  │
  ▼
Create Session
  │
  ├── Access Token
  └── Refresh Token
        │
        ▼
Store Hash
        │
        ▼
Set Cookie
        │
        ▼
Return Response
```

---

# 12. Authorization Architecture

Authorization is implemented through dynamic permission lookup.

Request flow:

```text
Request
   │
   ▼
Authenticate
   │
   ├── Invalid → 401
   │
   ▼
Load User
   │
   ▼
Load Role
   │
   ▼
Load Permissions
   │
   ▼
Check Required Permission
   │
   ├── Missing → 403
   │
   ▼
Controller
```

The authorization system must not rely exclusively on permissions embedded in JWT tokens.

This ensures permission changes take effect without requiring users to log in again.

---

# 13. RBAC Data Model

Conceptually:

```text
User
 │
 │ belongs to
 ▼
Role
 │
 │ has many
 ▼
RolePermission
 │
 │ references
 ▼
Permission
 │
 ▼
PermissionGroup
```

Relationship:

```text
User
  │
  └── Role
       │
       └── RolePermission
             │
             └── Permission
                    │
                    └── PermissionGroup
```

---

# 14. Permission Naming Convention

Permissions should use:

```text
<module>:<action>
```

Examples:

```text
user:create
user:read
user:update
user:delete

role:create
role:read
role:update
role:delete

permission:create
permission:read
permission:update
permission:delete

product:watch
product:create
product:read
product:update
product:delete

media:upload
media:read
media:update
media:delete
```

`watch` may be used as the permission controlling visibility/access to a module.

---

# 15. Frontend Architecture

The frontend will use Next.js App Router.

Recommended structure:

```text
apps/web/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── permissions/
│   │   ├── roles/
│   │   ├── users/
│   │   ├── media/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── attributes/
│   │   └── products/
│   │
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── dialogs/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── permissions/
│   ├── roles/
│   ├── users/
│   ├── media/
│   ├── categories/
│   ├── brands/
│   ├── attributes/
│   └── products/
│
├── lib/
│   ├── api-client.ts
│   ├── query-client.ts
│   ├── auth.ts
│   └── permissions.ts
│
├── providers/
│   ├── QueryProvider.tsx
│   └── AuthProvider.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useDebounce.ts
│
├── services/
│   └── api/
│
├── stores/
│
├── types/
│
└── public/
```

---

# 16. Frontend Feature Architecture

Each feature should be self-contained.

Example:

```text
features/products/
│
├── components/
│   ├── ProductTable.tsx
│   ├── ProductForm.tsx
│   ├── ProductFilters.tsx
│   ├── ProductMedia.tsx
│   ├── VariantTable.tsx
│   └── VariantGenerator.tsx
│
├── hooks/
│   ├── useProducts.ts
│   ├── useProduct.ts
│   ├── useCreateProduct.ts
│   └── useUpdateProduct.ts
│
├── api/
│   └── products.api.ts
│
├── schemas/
│   └── product.schema.ts
│
├── types/
│   └── product.types.ts
│
└── utils/
    └── variant.utils.ts
```

This keeps feature-specific code together.

---

# 17. Frontend State Management

The application should distinguish between:

```text
Server State
Client State
UI State
```

## Server State

Use TanStack Query for:

* Users.
* Roles.
* Permissions.
* Products.
* Categories.
* Brands.
* Attributes.
* Media.

Example:

```text
useQuery()
useMutation()
useInfiniteQuery()
```

---

## Client State

Use lightweight state management only when necessary.

Potential use cases:

* Authentication state.
* Sidebar state.
* User preferences.

---

## UI State

Keep local state inside components when possible.

Examples:

* Dialog open/close.
* Selected row.
* Form state.
* Temporary filters.

Do not put every piece of state into a global store.

---

# 18. API Client Architecture

Create one centralized API client.

```text
lib/api-client.ts
```

Responsibilities:

* Base URL.
* Authorization headers.
* JSON parsing.
* Error normalization.
* 401 handling.
* Refresh token flow.

Request flow:

```text
React Component
      │
      ▼
TanStack Query
      │
      ▼
API Service
      │
      ▼
API Client
      │
      ▼
Express API
```

---

# 19. Token Refresh Architecture

When an API returns `401`:

```text
Request
  │
  ▼
401
  │
  ▼
Refresh Request
  │
  ├── Success
  │      │
  │      ▼
  │   Retry Original Request
  │
  └── Failure
         │
         ▼
     Clear Session
         │
         ▼
     Redirect Login
```

The frontend must prevent multiple concurrent refresh requests.

Use a shared refresh promise or equivalent locking mechanism.

---

# 20. Permission-Aware UI Architecture

The frontend should expose a permission utility.

Example:

```typescript
can("product:create")
```

or:

```typescript
hasPermission("product:create")
```

Usage:

```text
if user can product:create
    show Create Product button
```

Navigation:

```text
product:watch
    ↓
Show Products Menu
```

Actions:

```text
product:create
    ↓
Show Create Button

product:update
    ↓
Show Edit Button

product:delete
    ↓
Show Delete Button
```

Frontend permission checks improve UX.

Backend permission checks provide security.

---

# 21. Product Domain Architecture

Products have two primary types.

```text
Product
│
├── SIMPLE
│
└── VARIABLE
```

Simple:

```text
Product
├── SKU
├── Price
├── Sale Price
├── Stock
└── Media
```

Variable:

```text
Product
│
└── ProductVariant
      ├── SKU
      ├── Price
      ├── Stock
      ├── Attributes
      └── Media
```

---

# 22. Product Relationship Architecture

```text
Product
│
├────────────── Brand
│
├────────────── ProductCategory
│                    │
│                    └── Category
│
├────────────── ProductMedia
│                    │
│                    └── Media
│
└────────────── ProductVariant
                     │
                     ├── VariantAttributeValue
                     │        │
                     │        └── AttributeValue
                     │
                     └── VariantMedia
                              │
                              └── Media
```

---

# 23. Variant Generation Architecture

Variant generation should be implemented as a pure domain utility/service.

Input:

```text
Color:
Red
Blue

Size:
S
M
L
```

Output:

```text
[
  [Red, S],
  [Red, M],
  [Red, L],
  [Blue, S],
  [Blue, M],
  [Blue, L]
]
```

The variant generator should:

1. Receive selected attributes.
2. Calculate Cartesian combinations.
3. Return combinations.
4. Allow the user to remove combinations.
5. Validate uniqueness.
6. Persist variants transactionally.

The generator should not directly access the database.

---

# 24. Media Architecture

The Media module should abstract physical file storage.

Recommended abstraction:

```text
Media Service
      │
      ▼
Storage Provider
      │
      ├── Local Storage
      │
      └── Future S3-Compatible Storage
```

The application should avoid coupling business logic directly to the local filesystem.

This allows future migration to:

* Amazon S3.
* Cloudflare R2.
* MinIO.
* Other object storage.

---

# 25. Database Architecture

PostgreSQL will be the primary relational database.

Prisma will be used as the ORM.

Conceptual schema:

```text
Identity
│
├── User
├── Role
├── PermissionGroup
├── Permission
├── RolePermission
└── RefreshSession

Media
│
└── Media

Catalog
│
├── Category
├── Brand
├── Attribute
└── AttributeValue

Products
│
├── Product
├── ProductCategory
├── ProductVariant
├── VariantAttributeValue
├── ProductMedia
├── VariantMedia
└── AttributeValueMedia
```

---

# 26. Database Integrity Rules

Database constraints should enforce:

* Unique email.
* Unique role name.
* Unique permission name.
* Unique category slug.
* Unique brand slug.
* Unique attribute slug.
* Unique product slug.
* Unique product SKU.
* Unique variant SKU.

Composite uniqueness should protect:

```text
Product + Category
Variant + AttributeValue
Attribute + Value
```

The database should be treated as the final integrity boundary.

Application-level validation is necessary but insufficient by itself.

---

# 27. Transaction Architecture

Transactions are required whenever multiple dependent operations must succeed together.

Example:

```text
Create Product
│
├── Product Record
├── Categories
├── Brand
├── Media
├── Variants
└── Variant Attributes
```

Use:

```typescript
prisma.$transaction(...)
```

If any step fails:

```text
ROLLBACK
```

The service layer should control transaction boundaries.

---

# 28. API Versioning

The initial API should use:

```text
/api/v1
```

Example:

```text
/api/v1/auth/login
/api/v1/users
/api/v1/roles
/api/v1/permissions
/api/v1/products
```

Future breaking changes can be introduced as:

```text
/api/v2
```

---

# 29. API Route Organization

Recommended:

```text
/api/v1
│
├── /auth
├── /users
├── /roles
├── /permissions
├── /media
├── /categories
├── /brands
├── /attributes
└── /products
```

The route index should aggregate module routes.

Example:

```text
routes/index.ts
```

This file should not contain business logic.

---

# 30. Standard API Response

Success:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

Paginated:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

---

# 31. Error Architecture

All application errors should flow through one centralized error handler.

```text
Error
  │
  ▼
Service / Controller
  │
  ▼
next(error)
  │
  ▼
Global Error Handler
  │
  ▼
Normalized Response
```

Custom errors should extend a common application error.

Example:

```text
AppError
├── code
├── message
├── statusCode
└── details
```

---

# 32. Security Architecture

Security layers:

```text
HTTPS
  ↓
CORS
  ↓
Helmet
  ↓
Rate Limiting
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Business Rules
  ↓
Database Constraints
```

Security must exist at multiple layers.

---

# 33. File Upload Security

All uploads must be validated.

Validation includes:

```text
MIME Type
File Extension
File Size
Image Dimensions
```

The system should not trust the extension alone.

Uploaded files should receive generated server-side filenames.

Example:

```text
original:
product-image.png

stored:
f4b7a6c2-9e7b-4f5c-a123.png
```

---

# 34. Logging Architecture

Use structured logging.

Recommended:

```text
Pino
```

Log:

* Request ID.
* HTTP method.
* Route.
* Status code.
* Duration.
* Error code.
* User ID when available.

Never log:

* Passwords.
* JWT secrets.
* Refresh tokens.
* Sensitive credentials.

---

# 35. Observability

The initial implementation should support:

```text
Health Check
Structured Logs
Request IDs
Error Logging
```

Health endpoint:

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Future enhancements may include:

* Metrics.
* Distributed tracing.
* External error monitoring.

---

# 36. Configuration Architecture

Configuration must be centralized.

```text
config/
│
├── env.ts
├── database.ts
├── auth.ts
├── cors.ts
├── logger.ts
└── upload.ts
```

Environment variables should be validated at startup.

The application should fail fast when required configuration is missing.

---

# 37. Environment Architecture

Required environments:

```text
Development
Testing
Production
```

Example:

```text
.env
.env.test
.env.production
.env.example
```

Secrets must never be committed.

---

# 38. Docker Architecture

Development environment:

```text
Docker Compose
│
└── PostgreSQL
```

Application:

```text
Next.js
   │
   ▼
Express API
   │
   ▼
PostgreSQL
```

The API and frontend may initially run directly on the host machine during development while PostgreSQL runs through Docker.

---

# 39. Testing Architecture

Testing should exist at multiple levels.

```text
Testing
│
├── Unit Tests
│
├── Integration Tests
│
├── API Tests
│
└── End-to-End Tests
```

---

## Unit Tests

Test:

* Variant generator.
* Slug utilities.
* Permission utilities.
* Validation logic.

---

## Integration Tests

Test:

* Authentication.
* Authorization.
* Database interactions.
* Transactions.

---

## API Tests

Test:

```text
401
403
404
409
422
500
```

---

## E2E Tests

Test critical workflows:

```text
Login
    ↓
Dashboard
    ↓
Create Role
    ↓
Assign Permission
    ↓
Create User
    ↓
Login as User
    ↓
Verify Permission
    ↓
Create Product
```

---

# 40. Testing RBAC

RBAC must be tested using multiple users.

Example:

```text
Super Admin
    ↓
Full Access
```

```text
Catalog Manager
    ↓
Catalog Access
```

```text
Unauthorized User
    ↓
403
```

Direct API calls must be tested.

The system must not rely on hidden frontend buttons as authorization.

---

# 41. Deployment Architecture

Initial production architecture:

```text
                    Internet
                       │
                       ▼
                 Next.js App
                       │
                       │ HTTPS
                       ▼
                 Express API
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        PostgreSQL          Object Storage
                              / Media
```

---

# 42. Deployment Components

## Frontend

Deploy Next.js to a suitable hosting provider.

## Backend

Deploy Node.js API to a suitable server/container platform.

## Database

Use managed PostgreSQL when possible.

## Media

Use object storage in production.

Local filesystem storage should primarily be used for development.

---

# 43. CI/CD Architecture

Recommended pipeline:

```text
Git Push
   │
   ▼
CI Pipeline
   │
   ├── Install
   ├── Lint
   ├── Type Check
   ├── Unit Tests
   ├── Integration Tests
   ├── Build
   │
   ▼
Deploy
```

Pull requests should run:

```text
Lint
Type Check
Tests
Build
```

---

# 44. Module Dependency Rules

Modules should follow controlled dependencies.

Recommended:

```text
Auth
  ↓
User
  ↓
Role
  ↓
Permission
```

Catalog:

```text
Media
Category
Brand
Attribute
  ↓
Product
```

Product may depend on:

```text
Media
Category
Brand
Attribute
```

Avoid circular module dependencies.

---

# 45. Shared Infrastructure Rules

Shared utilities belong in:

```text
core/
lib/
utils/
```

Do not duplicate:

* Error handling.
* Pagination.
* API responses.
* Authentication logic.
* Permission checking.
* File validation.

Create reusable abstractions.

---

# 46. Dependency Direction

The preferred dependency direction is:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Database
```

Infrastructure should not depend on business modules.

Business modules may use shared infrastructure.

Avoid:

```text
Controller
    ↓
Prisma directly
```

Avoid:

```text
Route
    ↓
Business Logic
```

Avoid:

```text
Frontend
    ↓
Database
```

---

# 47. Architecture Decision Records

Major architectural decisions should be documented.

Examples:

```text
ADR-001 Modular Monolith
ADR-002 JWT Authentication
ADR-003 Refresh Token Rotation
ADR-004 RBAC Design
ADR-005 Prisma ORM
ADR-006 Local/Object Media Storage
ADR-007 Server-Side Product Filtering
```

These decisions should explain:

* Context.
* Decision.
* Alternatives.
* Consequences.

---

# 48. Scalability Strategy

The application should scale in stages.

## Stage 1

```text
Single API
Single PostgreSQL
Single Web App
```

## Stage 2

```text
Load Balanced API
Managed PostgreSQL
Object Storage
CDN
```

## Stage 3

Potential service extraction:

```text
Identity Service
Catalog Service
Media Service
Inventory Service
Order Service
```

The modular boundaries established in the monolith should make future extraction possible.

---

# 49. Recommended Development Boundaries

Develop features in vertical slices.

Example:

```text
Permission Module
│
├── Database
├── Repository
├── Service
├── Controller
├── Route
├── Tests
└── Frontend
```

Avoid implementing:

```text
All backend first
Then all frontend
```

for every module.

Instead:

```text
Permission
    ↓
Backend
    ↓
API Tests
    ↓
Frontend
    ↓
Integration
```

Then continue:

```text
Role
    ↓
Backend
    ↓
API Tests
    ↓
Frontend
    ↓
Integration
```

This reduces integration surprises.

---

# 50. Recommended Implementation Order

The architecture recommends the following sequence:

```text
1. Repository Setup
2. Monorepo Setup
3. Backend Foundation
4. Frontend Foundation
5. Docker + PostgreSQL
6. Prisma
7. Database Schema
8. Configuration
9. Error Handling
10. Logging
11. API Response System

12. Authentication
13. JWT
14. Refresh Sessions
15. Logout
16. Authentication Middleware

17. Permission Middleware
18. Permission Module
19. Role Module
20. User Module

21. RBAC Integration Tests

22. Media Module
23. Category Module
24. Brand Module
25. Attribute Module

26. Simple Product
27. Variable Product
28. Variant Generation
29. Product Media
30. Product Transactions

31. Product Search
32. Product Filtering
33. Product Pagination

34. Dashboard Shell
35. Authentication UI
36. Session Restoration
37. Token Refresh

38. Permission UI
39. Role UI
40. User UI
41. Media UI
42. Category UI
43. Brand UI
44. Attribute UI
45. Product UI

46. API Documentation
47. Automated Testing
48. Security Audit
49. Performance Audit
50. Code Quality Audit
51. Deployment
52. Final Documentation
```

---

# 51. Architecture Principles

The project must follow these principles.

## Security First

Authorization must always be enforced server-side.

## Database Integrity

Important business constraints should be enforced at the database level.

## Separation of Concerns

Controllers should not contain business logic.

## Single Responsibility

Each module and service should have a clear responsibility.

## Reusability

Common infrastructure should be centralized.

## Explicit Dependencies

Avoid hidden global dependencies.

## Transaction Safety

Multi-entity operations should be atomic.

## Server-Side Data Operations

Search, filtering, sorting, and pagination should be performed by the backend.

## Fail Fast

Invalid configuration should stop application startup.

## Progressive Complexity

Start with a modular monolith and introduce distributed architecture only when justified.

---

# 52. Architecture Summary

The final architecture can be summarized as:

```text
                    ┌─────────────────────┐
                    │       Admin         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js Web     │
                    │                     │
                    │  Feature Modules    │
                    │  TanStack Query     │
                    │  Permission UI      │
                    └──────────┬──────────┘
                               │
                               │ REST
                               ▼
                    ┌─────────────────────┐
                    │    Express API      │
                    │                     │
                    │ Authentication      │
                    │ Authorization       │
                    │ Validation          │
                    │ Controllers         │
                    │ Services            │
                    │ Repositories        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │ PostgreSQL │ │   Media    │ │  Logging   │
          │  + Prisma  │ │  Storage   │ │   Pino     │
          └────────────┘ └────────────┘ └────────────┘
```

The architecture establishes a clear separation between:

```text
Presentation
     ↓
API
     ↓
Business Logic
     ↓
Data Access
     ↓
Infrastructure
```

The most important architectural boundaries are:

```text
Authentication
        ↓
Authorization
        ↓
RBAC
        ↓
Catalog
        ↓
Product Domain
```

This structure provides a secure foundation for the current Ecommerce Admin Dashboard while keeping the application extensible for future ecommerce capabilities such as inventory, orders, customers, payments, shipping, analytics, and reporting.

The architecture should be treated as a **living technical document** and updated whenever a significant architectural decision changes the system's structure or behavior.
