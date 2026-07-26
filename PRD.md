# Product Requirements Document (PRD)

# Ecommerce Admin Dashboard

**Project:** Ecommerce Admin Dashboard
**Organization:** Trends Bird Limited
**Document Type:** Product Requirements Document
**Status:** Planned / In Development
**Primary Focus:** Secure Backend Architecture, RBAC, Catalog Management, Product Management
**Target Platform:** Web Application
**Architecture:** Full-Stack Web Application

---

# 1. Product Overview

The Ecommerce Admin Dashboard is a secure, role-based administrative platform designed to manage the core operational data of an ecommerce business.

The platform will provide authorized administrators and staff members with centralized management capabilities for:

* Users
* Roles
* Permissions
* Media
* Categories
* Brands
* Attributes
* Products
* Product Variants
* Product Media

The system is designed around a **backend-first and security-first architecture**, where authentication, authorization, data validation, database integrity, and transactional operations are treated as first-class requirements.

The application will support different administrative roles with granular permissions. A Super Administrator may have complete system access, while limited users may only access specific modules or perform specific actions.

The platform must ensure that authorization is enforced at the backend level, not only through frontend UI restrictions.

---

# 2. Product Vision

The goal is to build a production-oriented Ecommerce Admin Dashboard that provides:

1. Secure authentication.
2. Fine-grained role-based access control.
3. Centralized user and permission management.
4. Reusable media management.
5. Hierarchical category management.
6. Brand management.
7. Flexible product attribute management.
8. Simple and variable product management.
9. Product variant generation and management.
10. Strong validation and data integrity.
11. Transaction-safe product operations.
12. Search, filtering, sorting, and pagination.
13. A clean and maintainable administrative interface.

The system should be architected so that new ecommerce modules can be added in the future without requiring major architectural changes.

---

# 3. Product Goals

## 3.1 Primary Goals

### Goal 1 — Secure Authentication

Users must be able to securely authenticate and maintain sessions.

The system must support:

* Login.
* Access tokens.
* Refresh tokens.
* Refresh token rotation.
* Logout.
* Session restoration.
* Inactive user protection.

---

### Goal 2 — Fine-Grained Authorization

The system must provide permission-based access control.

Permissions follow the structure:

```text
module:action
```

Examples:

```text
product:create
product:read
product:update
product:delete
product:watch

media:upload

role:create
role:update

user:create
user:delete
```

Authorization must be enforced by the backend.

---

### Goal 3 — Flexible RBAC

Administrators must be able to:

* Create roles.
* Update roles.
* Delete roles.
* Assign permissions.
* Remove permissions.
* Grant all available permissions.

Users must be assigned roles.

Roles determine what users can access.

---

### Goal 4 — Centralized Catalog Management

Administrators should be able to manage:

* Categories.
* Brands.
* Attributes.
* Attribute values.
* Media.

These entities will be reused throughout the product management system.

---

### Goal 5 — Complete Product Management

The platform must support:

* Simple products.
* Variable products.
* Product variants.
* Product SKUs.
* Product pricing.
* Sale pricing.
* Inventory.
* Categories.
* Brands.
* Product media.
* Variant media.
* Attribute value media.

---

### Goal 6 — Data Integrity

The system must prevent invalid or inconsistent data.

Examples:

* Duplicate SKUs.
* Duplicate slugs.
* Duplicate variant combinations.
* Invalid category hierarchy.
* Invalid product pricing.
* Negative inventory.
* Deletion of referenced entities.
* Partial product creation.

---

### Goal 7 — Maintainability

The architecture must support:

* Modular development.
* Separation of concerns.
* Reusable services.
* Reusable components.
* Centralized validation.
* Centralized error handling.
* Testability.
* Future scalability.

---

# 4. Product Scope

The product consists of the following major modules:

```text
Authentication
Authorization
Permission Management
Role Management
User Management
Media Library
Category Management
Brand Management
Attribute Management
Product Management
Product Variant Management
Dashboard
```

---

# 5. User Roles

The initial system should support at least two seeded users.

## 5.1 Super Administrator

The Super Administrator has complete access to the system.

Capabilities include:

* Manage permissions.
* Manage roles.
* Manage users.
* Manage media.
* Manage categories.
* Manage brands.
* Manage attributes.
* Manage products.
* Manage product variants.

---

## 5.2 Limited Catalog User

The Limited Catalog User is designed to validate the RBAC implementation.

This user should have only the permissions explicitly assigned to their role.

For example:

```text
product:watch
product:read
product:create
product:update
category:watch
category:read
brand:watch
brand:read
```

The exact permissions can be configured through the Role Management module.

The Limited Catalog User must not be able to access unauthorized administrative operations.

---

# 6. Authentication Requirements

## 6.1 Login

The system shall provide a login endpoint.

Example:

```text
POST /auth/login
```

Users must provide:

```text
Email
Password
```

### Successful Login

The system should:

1. Validate credentials.
2. Verify the user exists.
3. Verify the user is active.
4. Verify the password.
5. Generate an access token.
6. Generate a refresh token.
7. Store the refresh token securely.
8. Return authenticated user information.

---

## 6.2 Access Token

Access tokens should be:

* JWT-based.
* Short-lived.
* Used for protected API requests.

Example:

```text
Authorization: Bearer <access-token>
```

---

## 6.3 Refresh Token

Refresh tokens should:

* Be long-lived.
* Be stored using secure HttpOnly cookies.
* Be stored hashed in the database.
* Support rotation.
* Support revocation.

---

## 6.4 Refresh Token Rotation

When a refresh token is used:

```text
Old Refresh Token
        ↓
Revoke
        ↓
Create New Refresh Token
        ↓
Issue New Access Token
```

The previous refresh token must not remain reusable.

---

## 6.5 Logout

Logout must invalidate the refresh session server-side.

Deleting only the frontend cookie is insufficient.

---

## 6.6 Inactive Users

Inactive users must not be able to:

* Login.
* Refresh sessions.
* Access protected resources.

---

# 7. Authorization Requirements

The authorization system shall use permission-based RBAC.

## Permission Format

```text
module:action
```

Example:

```text
product:create
```

---

## 7.1 Authentication Middleware

Every protected endpoint must require authentication.

If authentication is missing or invalid:

```text
401 Unauthorized
```

---

## 7.2 Permission Middleware

Every protected operation must verify the required permission.

Example:

```typescript
authorize("product:create")
```

If the user is authenticated but does not have the permission:

```text
403 Forbidden
```

---

## 7.3 Backend Enforcement

Frontend permission checks must never be considered sufficient security.

The API must independently enforce authorization.

A user attempting to call a protected endpoint directly through Postman or another HTTP client must still be rejected.

---

# 8. Permission Management

The Permission module manages the permission vocabulary of the system.

## Features

* Create permission.
* Read permissions.
* Update permissions.
* Delete permissions.
* Create permission groups.
* Search permissions.
* Paginate permissions.
* Support standard actions.
* Support custom actions.

---

## 8.1 Standard Actions

Possible actions include:

```text
watch
create
read
update
delete
upload
write
approve
status
```

Only relevant actions should be assigned to each module.

---

## 8.2 Custom Permissions

The system may support custom permissions such as:

```text
product:publish
product:approve
product:export
```

Permission names must be unique.

---

# 9. Role Management

Roles group permissions together.

## Features

* Create role.
* Read role.
* Update role.
* Delete role.
* Assign permissions.
* Remove permissions.
* Grant all permissions.
* Search roles.
* Paginate roles.

---

## 9.1 Role Creation

A role must have:

```text
Name
Permissions
```

Role names must be unique.

---

## 9.2 Permission Assignment

Administrators can assign multiple permissions to a role.

Example:

```text
Catalog Manager

product:watch
product:read
product:create
product:update

category:watch
category:read
category:create
category:update

brand:watch
brand:read
```

---

## 9.3 Role Deletion

A role assigned to users should not be deleted unless those user relationships are safely handled.

Recommended behavior:

```text
Role has assigned users
        ↓
Reject deletion
```

---

# 10. User Management

The User module manages administrative users.

## Features

* Create user.
* Read user.
* Update user.
* Delete user.
* Assign role.
* Activate user.
* Deactivate user.
* Search.
* Filter.
* Pagination.

---

## 10.1 User Creation

Required:

```text
Name
Email
Password
Role
```

Passwords must be securely hashed.

---

## 10.2 User Status

Users may have:

```text
Active
Inactive
```

Inactive users cannot authenticate or refresh sessions.

---

## 10.3 Self-Privilege Protection

A user must not be able to:

* Change their own role.
* Grant themselves permissions.
* Escalate their privileges.

---

# 11. Media Library

The Media Library provides centralized asset management.

## Features

* Upload single file.
* Upload multiple files.
* File validation.
* MIME validation.
* File size validation.
* Thumbnail generation.
* Search.
* Pagination.
* Type filtering.
* Metadata editing.
* Delete.

---

## 11.1 Supported Media

The initial implementation should support common image formats such as:

```text
JPEG
PNG
WebP
GIF
```

---

## 11.2 Media Metadata

The system should maintain:

```text
ID
Original Name
File Name
MIME Type
File Size
Width
Height
URL
Thumbnail URL
Alt Text
Title
Uploaded By
Created At
```

---

## 11.3 Media Reusability

A media asset should be reusable across:

* Products.
* Product variants.
* Attribute values.
* Brands.
* Categories.

The system should avoid unnecessary duplicate uploads.

---

## 11.4 Media Deletion

Recommended rule:

```text
Attached Media → Deletion Refused
Unused Media → Deletion Allowed
```

---

# 12. Category Management

Categories organize products.

The category system must support unlimited nesting.

Example:

```text
Electronics
├── Mobile
│   ├── Android
│   └── iPhone
├── Laptop
└── Accessories
```

## Features

* Create category.
* Read category.
* Update category.
* Delete category.
* Assign parent.
* Tree view.
* Search.
* Pagination.
* Image.
* Active status.
* Sort order.

---

## 12.1 Category Hierarchy

The system must prevent:

* Self-parenting.
* Circular references.
* Invalid parent relationships.

---

## 12.2 Category Deletion

A category cannot be deleted if:

* It contains child categories.
* It is assigned to products.

---

# 13. Brand Management

Brands represent product manufacturers or brand identities.

## Features

* Create.
* Read.
* Update.
* Delete.
* Search.
* Pagination.
* Status filtering.
* Logo management.

---

## 13.1 Brand Validation

Brand names and slugs must be unique.

---

## 13.2 Brand Deletion

A brand referenced by products should not be deleted.

---

# 14. Attribute Management

Attributes define product variations.

Examples:

```text
Color
Size
Material
Storage
RAM
```

## Attribute Types

```text
dropdown
radio
checkbox
colour_swatch
image_swatch
```

---

## 14.1 Attribute Values

Example:

```text
Color
├── Red
├── Blue
└── Black
```

```text
Size
├── S
├── M
└── L
```

Attribute values may contain:

* Name.
* Value.
* Color hex.
* Media reference.

---

## 14.2 Attribute Deletion

Attributes and values referenced by product variants must not be deleted.

---

# 15. Product Management

Product management is the primary catalog module.

The system must support:

```text
Simple Products
Variable Products
```

---

# 16. Simple Products

A simple product does not have variants.

Example:

```text
Product
├── Price
├── Sale Price
├── Stock
└── Stock Status
```

## Features

* Create.
* Read.
* Update.
* Delete.
* SKU.
* Slug.
* Price.
* Sale price.
* Stock.
* Brand.
* Categories.
* Media.
* Thumbnail.
* Gallery.
* Status.
* Featured status.
* Sort order.

---

# 17. Variable Products

Variable products contain multiple variants.

Example:

```text
T-Shirt
├── Red / S
├── Red / M
├── Red / L
├── Blue / S
├── Blue / M
└── Blue / L
```

---

# 18. Product Variants

Each variant should support:

```text
SKU
Price
Sale Price
Stock
Low Stock Threshold
Weight
Status
Attributes
Media
```

---

## 18.1 Variant Generation

Given:

```text
Color:
Red
Blue

Size:
S
M
L
```

The system generates:

```text
Red + S
Red + M
Red + L
Blue + S
Blue + M
Blue + L
```

Administrators can remove combinations that are not applicable.

---

## 18.2 Variant Validation

The system must reject:

* Duplicate SKU.
* Duplicate variant combinations.
* Invalid attribute values.
* Negative price.
* Negative stock.
* Sale price greater than regular price.

---

# 19. Product Media

Products may contain:

```text
Thumbnail
Gallery
```

Variants may contain:

```text
Variant Thumbnail
Variant Gallery
```

Attribute values may reference:

```text
Swatch Image
```

---

## 19.1 Media Rules

A product should have:

```text
Exactly one primary thumbnail
Multiple gallery images
```

A gallery should support:

* Ordering.
* Reordering.
* Adding.
* Removing.

---

# 20. Product Search & Filtering

The product listing must support server-side operations.

## Search

Search by:

* Product name.
* SKU.

## Filters

* Category.
* Brand.
* Status.

## Sorting

Support sorting by relevant product fields.

## Pagination

Pagination must be handled by the backend.

The frontend must not fetch the entire product database and filter locally.

---

# 21. Data Validation Requirements

All external input must be validated.

Validation should occur before business logic.

Use schema-based validation.

Examples:

```text
Invalid email
Invalid price
Negative stock
Duplicate SKU
Invalid slug
Invalid category
Invalid attribute
Invalid media
```

The API must return structured validation errors.

---

# 22. Transaction Requirements

Operations involving multiple related entities must use database transactions.

Example:

```text
Create Product
    ↓
Create Variants
    ↓
Attach Categories
    ↓
Attach Brand
    ↓
Attach Media
    ↓
Attach Variant Attributes
```

All operations must succeed together.

If one operation fails:

```text
ROLLBACK
```

No partially created product should remain.

---

# 23. Dashboard Requirements

The dashboard should provide a consistent administrative shell.

## Components

```text
Sidebar
Topbar
User Profile
Main Content
Notifications
```

The sidebar must be permission-aware.

---

## 23.1 Permission-Aware UI

Navigation visibility should be based on:

```text
module:watch
```

Action buttons should be based on:

```text
module:create
module:update
module:delete
```

Frontend restrictions are for usability only.

Backend authorization remains mandatory.

---

# 24. Frontend Requirements

The frontend should provide administrative interfaces for:

```text
Login
Dashboard
Permission
Role
User
Media
Category
Brand
Attribute
Product
```

Every page must handle:

```text
Loading
Empty
Error
Success
Validation
Unauthorized
Forbidden
```

---

# 25. API Requirements

The API must follow RESTful conventions.

Example:

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

Nested operations may include:

```text
POST   /roles/:id/permissions
DELETE /roles/:id/permissions/:permissionId

POST   /attributes/:id/values
PUT    /attributes/:id/values/:valueId
DELETE /attributes/:id/values/:valueId
```

All nested routes must be independently protected by authorization middleware.

---

# 26. Error Handling Requirements

The API must use centralized error handling.

Errors must include:

```text
HTTP Status
Message
Error Code
Optional Details
```

Examples:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

The API must never expose:

* Password hashes.
* Refresh tokens.
* JWT secrets.
* Database credentials.
* Internal filesystem paths.
* Stack traces in production.

---

# 27. Security Requirements

The system must implement:

* Password hashing.
* JWT authentication.
* Refresh token rotation.
* HttpOnly cookies.
* Secure cookies in production.
* Helmet.
* CORS configuration.
* Rate limiting.
* Input validation.
* Authorization middleware.
* Database constraints.
* Secure error handling.

Authentication endpoints should be rate-limited.

---

# 28. Performance Requirements

The system should:

* Use database-level pagination.
* Use indexed fields for frequent searches.
* Avoid N+1 queries.
* Use Prisma relation loading carefully.
* Avoid unnecessary database queries.
* Use transactions where required.
* Optimize image processing.
* Generate thumbnails for large images.

---

# 29. Non-Functional Requirements

## Maintainability

Code must be modular and readable.

Recommended structure:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
```

---

## Scalability

The architecture should allow future modules such as:

```text
Orders
Customers
Coupons
Inventory
Payments
Shipping
Reports
Analytics
```

to be added without rewriting existing modules.

---

## Reliability

The application must:

* Fail safely.
* Validate all external input.
* Maintain database consistency.
* Avoid partial operations.
* Handle API failures gracefully.

---

# 30. Recommended Technology Stack

## Backend

```text
Node.js
TypeScript
Express
PostgreSQL
Prisma
JWT
bcrypt
Zod
Multer
Sharp
Pino
Helmet
```

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
TanStack Table
Lucide
```

## Development

```text
Docker
Docker Compose
Git
GitHub
ESLint
Prettier
Vitest
Supertest
Swagger/OpenAPI
Postman
```

---

# 31. Success Criteria

The project will be considered successful when:

1. Users can securely authenticate.
2. Refresh tokens are securely rotated.
3. Logout invalidates server-side sessions.
4. Inactive users cannot authenticate.
5. Every protected API requires authentication.
6. Every protected operation enforces permissions.
7. 401 and 403 responses are correct.
8. Permissions can be managed.
9. Roles can be managed.
10. Users can be assigned roles.
11. Media can be uploaded and reused.
12. Categories support unlimited nesting.
13. Brands can be managed.
14. Attributes and values can be managed.
15. Simple products can be created.
16. Variable products can be created.
17. Variants can be generated.
18. Duplicate SKUs are prevented.
19. Invalid variant combinations are prevented.
20. Product operations are transaction-safe.
21. Product listing supports search and filtering.
22. Frontend permissions match backend permissions.
23. APIs are documented.
24. Tests cover critical authentication and authorization paths.
25. The project can be deployed from a clean environment.

---

# 32. Out of Scope

The following features are not part of the initial implementation unless explicitly added later:

* Customer-facing ecommerce storefront.
* Order processing.
* Payment gateway.
* Shipping management.
* Customer management.
* Coupon management.
* Advanced inventory management.
* Warehouse management.
* Sales analytics.
* AI-powered features.
* Recommendation systems.
* Automated product descriptions.
* AI product categorization.
* AI search.

These can be introduced as future modules without changing the core architecture.

---

# 33. Future Roadmap

After the initial release, the system can be extended with:

```text
Orders
    ↓
Customers
    ↓
Inventory
    ↓
Warehouses
    ↓
Coupons
    ↓
Payments
    ↓
Shipping
    ↓
Reports
    ↓
Analytics
    ↓
Audit Logs
    ↓
Notifications
```

Potential future architecture:

```text
Admin Dashboard
       │
       ├── Identity & Access
       │
       ├── Catalog
       │
       ├── Inventory
       │
       ├── Orders
       │
       ├── Customers
       │
       ├── Payments
       │
       └── Analytics
```

---

# 34. Product Completion Definition

The product is considered complete when a clean environment can perform the following flow:

```text
Fresh PostgreSQL Database
        ↓
Run Migration
        ↓
Run Seed
        ↓
Start Backend
        ↓
Start Frontend
        ↓
Super Admin Login
        ↓
Limited User Login
        ↓
Verify RBAC
        ↓
Manage Permissions
        ↓
Manage Roles
        ↓
Manage Users
        ↓
Upload Media
        ↓
Create Categories
        ↓
Create Brands
        ↓
Create Attributes
        ↓
Create Simple Product
        ↓
Create Variable Product
        ↓
Generate Variants
        ↓
Attach Media
        ↓
Search / Filter Products
        ↓
Verify Authorization
        ↓
Deploy
```

The final system should prioritize:

```text
Security
    >
Authorization
    >
Data Integrity
    >
Backend Correctness
    >
Validation
    >
Transactions
    >
API Completeness
    >
Frontend Completeness
    >
Visual Polish
```

---

# 35. Relationship Between Project Documents

The project documentation should be organized as:

```text
README.md
    │
    ├── PRD.md
    │       ↓
    │   What the product must do
    │
    ├── Architecture.md
    │       ↓
    │   How the system is designed
    │
    ├── Phases.md
    │       ↓
    │   How the system will be implemented
    │
    └── API Documentation
            ↓
        How the system is consumed
```

The **PRD** defines the product requirements and expected behavior.

The **Architecture document** defines the technical design.

The **Phases document** defines the implementation sequence.

The **README** explains how developers and reviewers can run and evaluate the project.
