# Ecommerce Admin Dashboard API Documentation

Complete API documentation for every endpoint implemented in the Ecommerce Admin Dashboard REST API backend (`http://localhost:8080/api/v1`).

---

## Global Standards & Conventions

### Base URL & Server Options
- **Development Server**: `http://localhost:8080/api/v1`
- **Health Base URL**: `http://localhost:8080/health`

### Headers
- `Content-Type: application/json` (Required for JSON request bodies)
- `Authorization: Bearer <accessToken>` (Required for all protected routes)
- `X-Request-ID: <uuid>` (Optional; system will auto-generate if missing and return it in headers)

### Rate Limiting
- **Global Limit**: 100 requests per 15 minutes per IP address across all `/api/v1/*` routes.
- **Headers Returned**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### Standard Response Schemas

#### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation description string",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "Human readable error summary",
  "error": {
    "code": "ERROR_CODE_ENUM",
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

## Table of Contents
1. [Health & System Endpoints](#1-health--system-endpoints)
2. [Authentication Module (`/auth`)](#2-authentication-module-auth)
3. [User Management Module (`/users`)](#3-user-management-module-users)
4. [Role Management Module (`/roles`)](#4-role-management-module-roles)
5. [Permission Management Module (`/permissions`)](#5-permission-management-module-permissions)
6. [Media Management Module (`/media`)](#6-media-management-module-media)
7. [Media Folders Module (`/media-folders`)](#7-media-folders-module-media-folders)
8. [Category Catalog Module (`/categories`)](#8-category-catalog-module-categories)
9. [Brand Catalog Module (`/brands`)](#9-brand-catalog-module-brands)
10. [Attribute Catalog Module (`/attributes`)](#10-attribute-catalog-module-attributes)
11. [Product Catalog Module (`/products`)](#11-product-catalog-module-products)


---

## 1. Health & System Endpoints

### `GET /health`
* **Summary**: Server and PostgreSQL pool health check.
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
      "timestamp": "2026-07-31T22:50:00.000Z",
      "latencyMs": 14
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
      "details": [{ "message": "Connection refused by host" }]
    }
  }
  ```

### `GET /`
* **Summary**: Root API version information.
* **Authentication**: None (Public)
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Ecommerce Admin Dashboard API is running",
    "data": {
      "version": "1.0.0",
      "docs": "/api/v1"
    }
  }
  ```

---

## 2. Authentication Module (`/auth`)

### `POST /api/v1/auth/login`
* **Summary**: Authenticate user credentials, generate access JWT token, and set HttpOnly refresh token cookie.
* **Authentication**: None (Public)
* **Permission**: None
* **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | `string` | Yes | Valid user email address |
  | `password` | `string` | Yes | Account password |

  *Example Request Body*:
  ```json
  {
    "email": "admin@example.com",
    "password": "Admin123!"
  }
  ```
* **Success Response (`200 OK`)**:
  - Sets HttpOnly Cookie: `refreshToken=<token>; HttpOnly; SameSite=Lax; Path=/api/v1/auth`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "e4a3b2c1-89ab-4cde-0123-456789abcdef",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "roleId": "r1a2b3c4-5678-90ab-cdef-1234567890ab",
        "status": "ACTIVE",
        "createdAt": "2026-07-31T12:00:00.000Z",
        "updatedAt": "2026-07-31T12:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing email or password format invalid.
  - `401 Unauthorized` (`AUTH_UNAUTHORIZED`): Incorrect email/password or account is `INACTIVE` / `SUSPENDED`.

---

### `POST /api/v1/auth/refresh`
* **Summary**: Rotate refresh session and issue new access JWT using `refreshToken` HttpOnly cookie.
* **Authentication**: Cookie (`refreshToken`)
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Refresh token is missing, expired, or revoked",
    "error": {
      "code": "AUTH_UNAUTHORIZED",
      "details": []
    }
  }
  ```

---

### `POST /api/v1/auth/logout`
* **Summary**: Revoke current user's refresh session and clear `refreshToken` cookie.
* **Authentication**: Cookie / Public
* **Permission**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### `GET /api/v1/auth/session`
* **Summary**: Restore active session details, user profile, role, and active permissions array.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: Authenticated User
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Session restored",
    "data": {
      "user": {
        "id": "e4a3b2c1-89ab-4cde-0123-456789abcdef",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "roleId": "r1a2b3c4-5678-90ab-cdef-1234567890ab",
        "status": "ACTIVE"
      },
      "role": {
        "id": "r1a2b3c4-5678-90ab-cdef-1234567890ab",
        "name": "SUPER_ADMIN",
        "description": "Full system access"
      },
      "permissions": [
        "users:read", "users:create", "users:update", "users:delete",
        "roles:read", "roles:create", "roles:update", "roles:delete",
        "permissions:read", "permissions:create", "permissions:update", "permissions:delete",
        "products:read", "products:create", "products:update", "products:delete",
        "categories:read", "categories:create", "categories:update", "categories:delete",
        "brands:read", "brands:create", "brands:update", "brands:delete",
        "attributes:read", "attributes:create", "attributes:update", "attributes:delete",
        "media:read", "media:create", "media:update", "media:delete"
      ]
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**: Missing or expired access token.

---

## 3. User Management Module (`/users`)

### `GET /api/v1/users`
* **Summary**: Retrieve a paginated list of system users.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:read`
* **Query Parameters**:
  | Parameter | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `page` | `integer` | `1` | Page number |
  | `limit` | `integer` | `20` | Items per page (max 100) |
  | `search` | `string` | - | Case-insensitive search on `email`, `firstName`, `lastName` |
  | `roleId` | `UUID` | - | Filter by role UUID |
  | `status` | `string` | - | Filter by `ACTIVE`, `INACTIVE`, or `SUSPENDED` |

* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Users fetched successfully",
    "data": [
      {
        "id": "u123...",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "roleId": "r123...",
        "status": "ACTIVE",
        "role": { "id": "r123...", "name": "SUPER_ADMIN" },
        "createdAt": "2026-07-31T12:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

---

### `POST /api/v1/users`
* **Summary**: Create a new system user.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:create`
* **Request Body**:
  ```json
  {
    "email": "manager@example.com",
    "password": "SecurePassword123!",
    "firstName": "Catalog",
    "lastName": "Manager",
    "roleId": "d3b07384-d113-460a-86c2-466d6d8438ed",
    "status": "ACTIVE"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "id": "u456...",
      "email": "manager@example.com",
      "firstName": "Catalog",
      "lastName": "Manager",
      "roleId": "d3b07384-d113-460a-86c2-466d6d8438ed",
      "status": "ACTIVE",
      "createdAt": "2026-07-31T22:50:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Password under 8 chars or invalid role UUID.
  - `409 Conflict` (`DUPLICATE_RESOURCE`): User with this email already exists.

---

### `GET /api/v1/users/:id`
* **Summary**: Get single user details by ID.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:read`
* **Path Parameters**: `id` (UUID)
* **Success Response (`200 OK`)**: User details JSON.
* **Error Response (`404 Not Found`)**: `NOT_FOUND_ERROR`.

---

### `PATCH /api/v1/users/:id`
* **Summary**: Update user profile information.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:update`
* **Request Body**: `{ "firstName"?: string, "lastName"?: string, "email"?: string }`
* **Success Response (`200 OK`)**: Updated user object.

---

### `PATCH /api/v1/users/:id/role`
* **Summary**: Update user role assignment.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:update`
* **Request Body**: `{ "roleId": "UUID" }`
* **Success Response (`200 OK`)**: User object with new role ID.

---

### `PATCH /api/v1/users/:id/status`
* **Summary**: Change user account status.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:update`
* **Request Body**: `{ "status": "ACTIVE" | "INACTIVE" | "SUSPENDED" }`
* **Success Response (`200 OK`)**: Updated user status.

---

### `DELETE /api/v1/users/:id`
* **Summary**: Soft-delete a user account.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `users:delete`
* **Success Response (`200 OK`)**: `{ "success": true, "message": "User deleted successfully" }`

---

## 4. Role Management Module (`/roles`)

### `GET /api/v1/roles`
* **Summary**: Paginated listing of system and custom roles.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:read`
* **Success Response (`200 OK`)**: List of roles with permission count.

### `POST /api/v1/roles`
* **Summary**: Create a custom role.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:create`
* **Request Body**:
  ```json
  {
    "name": "CATALOG_EDITOR",
    "description": "Can manage products and categories",
    "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
  }
  ```
* **Success Response (`201 Created`)**: Created role object.

### `GET /api/v1/roles/:id`
* **Summary**: Get detailed role object with assigned permissions.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:read`

### `PATCH /api/v1/roles/:id`
* **Summary**: Update role name, description, or permission assignments.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:update`

### `DELETE /api/v1/roles/:id`
* **Summary**: Delete a custom role. System roles (`SUPER_ADMIN`, `ADMIN`, etc.) cannot be deleted.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:delete`
* **Error Response (`400 Bad Request`)**: `Cannot delete system role`.

### `POST /api/v1/roles/:id/permissions`
* **Summary**: Assign a single permission to a role.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:update`
* **Request Body**: `{ "permissionId": "UUID" }`

### `DELETE /api/v1/roles/:id/permissions/:permissionId`
* **Summary**: Revoke a single permission from a role.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:update`

### `POST /api/v1/roles/:id/permissions/grant-all`
* **Summary**: Grant all system permissions to a role.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `roles:update`

---

## 5. Permission Management Module (`/permissions`)

### `GET /api/v1/permissions/groups`
* **Summary**: Get permissions structured by permission group modules (`users`, `roles`, `products`, etc.).
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `permissions:read`
* **Success Response (`200 OK`)**: Hierarchical permission group list.

### `POST /api/v1/permissions/groups`
* **Summary**: Create a permission group.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `permissions:create`
* **Request Body**: `{ "name": "Orders", "module": "orders", "description"?: "Order module permissions" }`

### `GET /api/v1/permissions`
* **Summary**: Paginated list of permissions with filtering.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `permissions:read`

### `POST /api/v1/permissions`
* **Summary**: Create custom permission.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `permissions:create`
* **Request Body**: `{ "key": "orders:read", "name": "Read Orders", "module": "orders", "action": "read", "permissionGroupId": "UUID" }`

---

## 6. Media Management Module (`/media`)

### `POST /api/v1/media/upload`
* **Summary**: Upload a single file (Max 5MB). Automatically processes images into optimized thumbnails using Sharp.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:create`
* **Content-Type**: `multipart/form-data`
* **Form Data Fields**:
  - `file`: Binary file (Required)
  - `folderId`: Folder UUID (Optional)
  - `title`: File title (Optional)
  - `altText`: Alternative text (Optional)
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "id": "m123...",
      "originalName": "hero.png",
      "fileName": "1722466000-hero.webp",
      "url": "/uploads/1722466000-hero.webp",
      "thumbnailUrl": "/uploads/thumbnails/1722466000-hero.webp",
      "mimeType": "image/webp",
      "fileSize": 120400,
      "width": 1920,
      "height": 1080,
      "mediaType": "IMAGE"
    }
  }
  ```

### `POST /api/v1/media/upload-multiple`
* **Summary**: Upload up to 10 files simultaneously.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:create`
* **Content-Type**: `multipart/form-data`
* **Form Field**: `files` (array of binaries)

### `GET /api/v1/media`
* **Summary**: Search and paginate media items.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:read`
* **Query Parameters**: `page`, `limit`, `search`, `mediaType` (`IMAGE`|`VIDEO`|`DOCUMENT`), `folderId`.

---

## 7. Media Folders Module (`/media-folders`)

### `GET /api/v1/media-folders/tree`
* **Summary**: Get full recursive folder tree with media item counts.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:read`

### `POST /api/v1/media-folders`
* **Summary**: Create a media folder.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:create`
* **Request Body**: `{ "name": "Banners", "parentId": null }`

### `POST /api/v1/media-folders/move-media`
* **Summary**: Move multiple media files into a target folder.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `media:update`
* **Request Body**: `{ "mediaIds": ["m1", "m2"], "targetFolderId": "f-uuid" }`

---

## 8. Category Catalog Module (`/categories`)

### `GET /api/v1/categories/tree`
* **Summary**: Fetch full nested category tree.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `categories:read`

### `POST /api/v1/categories`
* **Summary**: Create a category.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `categories:create`
* **Request Body**:
  ```json
  {
    "name": "Electronics",
    "slug": "electronics",
    "description": "Gadgets & Hardware",
    "parentId": null,
    "status": "ACTIVE",
    "sortOrder": 1
  }
  ```

---

## 9. Brand Catalog Module (`/brands`)

### `GET /api/v1/brands`
* **Summary**: Paginated brand listing.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `brands:read`

### `POST /api/v1/brands`
* **Summary**: Create a brand.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `brands:create`
* **Request Body**: `{ "name": "Logitech", "slug": "logitech", "logoMediaId": "m-uuid" }`

---

## 10. Attribute Catalog Module (`/attributes`)

### `GET /api/v1/attributes`
* **Summary**: List attributes (e.g. Color, Size).
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `attributes:read`

### `POST /api/v1/attributes`
* **Summary**: Create attribute with optional initial values.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `attributes:create`
* **Request Body**:
  ```json
  {
    "name": "Color",
    "slug": "color",
    "type": "COLOR_SWATCH",
    "values": [
      { "value": "Red", "displayColor": "#FF0000" },
      { "value": "Blue", "displayColor": "#0000FF" }
    ]
  }
  ```

---

## 11. Product Catalog Module (`/products`)

### `GET /api/v1/products`
* **Summary**: Search and paginate products.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `products:read`
* **Query Parameters**: `page`, `limit`, `search`, `status`, `productType` (`SIMPLE`|`VARIABLE`), `brandId`, `categoryId`.

### `POST /api/v1/products/simple`
* **Summary**: Create a simple product.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `products:create`
* **Request Body**:
  ```json
  {
    "name": "Wireless Ergonomic Mouse",
    "sku": "MOUSE-W-01",
    "price": 49.99,
    "compareAtPrice": 59.99,
    "costPrice": 25.00,
    "stockQuantity": 150,
    "categoryIds": ["cat-uuid-1"],
    "status": "ACTIVE"
  }
  ```

### `POST /api/v1/products/variable`
* **Summary**: Create a variable product with multi-attribute variants.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `products:create`
* **Request Body**:
  ```json
  {
    "name": "Pro Gaming T-Shirt",
    "sku": "TSHIRT-PRO",
    "categoryIds": ["cat-uuid-1"],
    "variants": [
      {
        "sku": "TSHIRT-PRO-RED-S",
        "price": 29.99,
        "stockQuantity": 50,
        "attributeValueIds": ["val-red-uuid", "val-small-uuid"]
      }
    ]
  }
  ```

### `POST /api/v1/products/generate-matrix`
* **Summary**: Compute Cartesian product variant matrix for selected attribute value sets.
* **Authentication**: `Bearer <accessToken>`
* **Permission**: `products:create`
* **Request Body**:
  ```json
  {
    "attributeValueIdsGrouped": [
      ["val-red-uuid", "val-blue-uuid"],
      ["val-small-uuid", "val-large-uuid"]
    ]
  }
  ```
* **Success Response (`200 OK`)**: Array of 4 generated variant objects.


