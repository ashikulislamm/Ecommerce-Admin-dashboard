# Enterprise Ecommerce Admin Dashboard — API Documentation

This document provides complete, authoritative documentation for all REST API endpoints implemented in the Ecommerce Admin Dashboard backend.

---

## Base URL & General Headers

- **Base URL**: `http://localhost:8080/api/v1` (or relative path `/api/v1`)
- **Default Request Header**: `Content-Type: application/json`
- **Request ID Tracking**: All endpoints attach an `X-Request-ID` header (or auto-generate one) for end-to-end audit logging.
- **Global Rate Limit**: `100 requests per 15 minutes` per IP address across all `/api/v1/*` routes.

---

## Response & Error Conventions

### Standard Success Format (`200 OK`, `201 Created`)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Standard Error Format (`400`, `401`, `403`, `404`, `409`, `500`)

```json
{
  "success": false,
  "message": "Human-readable error explanation",
  "error": {
    "code": "ERROR_CODE_STRING",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

---

## 1. System & Health Endpoints

### `GET /health` (or `/api/v1/health`)
* **Description**: Verifies service status and live PostgreSQL database pool health.
* **Authentication**: None (Public)
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service is healthy",
    "data": {
      "status": "healthy",
      "database": "connected",
      "timestamp": "2026-07-31T22:45:00.000Z",
      "latencyMs": 12
    }
  }
  ```
* **Error Response (`503 Service Unavailable`)**:
  ```json
  {
    "success": false,
    "message": "Database connection failed",
    "error": {
      "code": "DATABASE_UNAVAILABLE",
      "details": [{ "message": "Connection refused" }]
    }
  }
  ```

---

## 2. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/login`
* **Description**: Authenticates user credentials, generates access JWT token, and sets HttpOnly refresh token cookie.
* **Authentication**: Public
* **Permission**: None
* **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "Admin123!"
  }
  ```
* **Success Response (`200 OK`)**:
  - **Set-Cookie Header**: `refreshToken=<jwt>; HttpOnly; SameSite=Lax; Path=/api/v1/auth`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "u1a2b3c4-...",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "roleId": "r1a2b3c4-...",
        "status": "ACTIVE"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Invalid email or missing password.
  - `401 Unauthorized` (`AUTH_UNAUTHORIZED`): Invalid credentials or inactive account.

### `POST /api/v1/auth/refresh`
* **Description**: Exchanges HttpOnly refresh cookie for a new short-lived access JWT (and rotates refresh session).
* **Authentication**: Refresh Cookie (`refreshToken`)
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**: Refresh token missing, expired, or revoked.

### `POST /api/v1/auth/logout`
* **Description**: Revokes active refresh session in DB and clears the HttpOnly refresh token cookie.
* **Authentication**: Cookie / Public
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### `GET /api/v1/auth/session`
* **Description**: Restores authenticated user profile, role info, and assigned permission keys.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: Authenticated User
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Session restored",
    "data": {
      "user": {
        "id": "u1a2b3c4-...",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "roleId": "r1a2b3c4-...",
        "status": "ACTIVE"
      },
      "role": {
        "id": "r1a2b3c4-...",
        "name": "SUPER_ADMIN",
        "description": "Full system access"
      },
      "permissions": [
        "users:read", "users:create", "users:update", "users:delete",
        "roles:read", "roles:create", "roles:update", "roles:delete",
        "products:read", "products:create", "products:update", "products:delete"
      ]
    }
  }
  ```

---

## 3. User Management (`/api/v1/users`)

### `GET /api/v1/users`
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:read`
* **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `search` (searches email, firstName, lastName)
  - `roleId` (filter by role UUID)
  - `status` (`ACTIVE` | `INACTIVE` | `SUSPENDED`)
  - `sortBy` (default: `createdAt`)
  - `sortOrder` (`asc` | `desc`)

### `POST /api/v1/users`
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:create`
* **Request Body**:
  ```json
  {
    "email": "manager@example.com",
    "password": "SecurePassword123!",
    "firstName": "Catalog",
    "lastName": "Manager",
    "roleId": "r-uuid-here",
    "status": "ACTIVE"
  }
  ```

---

## 4. Role & Permission Management (`/api/v1/roles`, `/api/v1/permissions`)

### Roles
- `GET /api/v1/roles` (Permission: `roles:read`) — Paginated roles listing.
- `POST /api/v1/roles` (Permission: `roles:create`) — Body: `{ name, description?, permissionIds? }`
- `GET /api/v1/roles/:id` (Permission: `roles:read`) — Details + assigned permissions.
- `PATCH /api/v1/roles/:id` (Permission: `roles:update`) — Update role fields or assigned permissions.
- `DELETE /api/v1/roles/:id` (Permission: `roles:delete`) — Delete role (protected against system roles).
- `POST /api/v1/roles/:id/permissions` (Permission: `roles:update`) — Body: `{ permissionId: string }`
- `DELETE /api/v1/roles/:id/permissions/:permissionId` (Permission: `roles:update`) — Revoke single permission.
- `POST /api/v1/roles/:id/permissions/grant-all` (Permission: `roles:update`) — Assign all system permissions.

### Permissions & Groups
- `GET /api/v1/permissions/groups` (Permission: `permissions:read`) — Returns grouped permissions tree.
- `GET /api/v1/permissions` (Permission: `permissions:read`) — Paginated permissions list.
- `POST /api/v1/permissions` (Permission: `permissions:create`) — Body: `{ key, name, module, action, description?, permissionGroupId }`

---

## 5. Media Library (`/api/v1/media`, `/api/v1/media-folders`)

- `POST /api/v1/media/upload` (Permission: `media:create`) — `multipart/form-data`, file max 5MB. Generates thumbnails for images via Sharp.
- `POST /api/v1/media/upload-multiple` (Permission: `media:create`) — Upload up to 10 files simultaneously.
- `GET /api/v1/media` (Permission: `media:read`) — Paginated search by `mediaType`, `folderId`, `search`.
- `GET /api/v1/media-folders/tree` (Permission: `media:read`) — Recursive folder hierarchy tree.
- `POST /api/v1/media-folders/move-media` (Permission: `media:update`) — Body: `{ mediaIds: string[], targetFolderId: string | null }`

---

## 6. Product & Catalog Management (`/api/v1/products`, `/api/v1/categories`, `/api/v1/brands`, `/api/v1/attributes`)

### Products
- `GET /api/v1/products` (Permission: `products:read`) — Query: `page`, `limit`, `search`, `status`, `productType`, `brandId`, `categoryId`.
- `POST /api/v1/products/simple` (Permission: `products:create`) — Create simple product with price, stock, SKU, categories, media.
- `POST /api/v1/products/variable` (Permission: `products:create`) — Create variable product with multi-attribute variants table.
- `POST /api/v1/products/generate-matrix` (Permission: `products:create`) — Computes Cartesian product matrix for selected attribute values.

---

## Error Codes Reference

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Zod schema payload validation failed |
| `AUTH_UNAUTHORIZED` | 401 | Missing, invalid, expired JWT access token or inactive account |
| `AUTH_FORBIDDEN` | 403 | Authenticated user lacks required permission key |
| `NOT_FOUND_ERROR` | 404 | Target resource UUID does not exist |
| `DUPLICATE_RESOURCE` | 409 | Unique constraint violation (e.g. email, SKU, slug) |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled backend internal exception |
