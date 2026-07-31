# Enterprise Ecommerce Admin Dashboard

A full-stack, enterprise-grade Ecommerce Admin Dashboard system built with **Node.js, Express 5, TypeScript, PostgreSQL, Prisma ORM**, and **Next.js 16 (App Router)** with **React 19, TailwindCSS, TanStack Query**, and **Zustand**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Migration](#migration)
- [Seed](#seed)
- [Run Commands](#run-commands)
- [Authentication Strategy](#authentication-strategy)
- [Authorization Strategy](#authorization-strategy)
- [Seed Credentials](#seed-credentials)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Known Issues](#known-issues)

---

## Project Overview

The Enterprise Ecommerce Admin Dashboard provides a complete management solution for modern e-commerce platforms. Built with performance, security, and scalability in mind, it features real-time session handling, robust Role-Based Access Control (RBAC), media library management with automatic image processing, full product catalog management (simple and multi-variant products), and an interactive UI.

---

## Features

- **Authentication & Security**:
  - Dual JWT architecture with access tokens in memory and HttpOnly refresh cookies.
  - Refresh token session rotation and revocation mechanism backed by PostgreSQL.
  - Automatic inactive user account protection.
- **Granular RBAC System**:
  - Permission groups (`users`, `roles`, `permissions`, `products`, `categories`, `brands`, `attributes`, `media`).
  - System roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`) and custom roles with fine-grained permission assignment.
  - Dynamic server-side permission checks on every request.
- **Media Library & Asset Management**:
  - Single and bulk file uploads with size and MIME type validation.
  - Automatic thumbnail generation via Sharp.
  - Hierarchical folder structure with tree navigation and media moving capabilities.
- **Catalog & Product Management**:
  - Category hierarchy (nested tree view with status and sorting).
  - Brand management with logo attachment.
  - Flexible Attribute system (Dropdown, Radio, Checkbox, Color Swatch, Image Swatch).
  - Simple and Variable product management with Cartesian product variant matrix generation.
- **Dashboard UI**:
  - Next.js 16 App Router UI with responsive sidebar navigation, dark/light theme options, TanStack Query state caching, and Toast feedback alerts.

---

## Architecture

```
                                  +-----------------------+
                                  |   Next.js Frontend    |
                                  | (React 19 / Zustand)  |
                                  +-----------+-----------+
                                              |
                                              | HTTP / REST (JWT + HttpOnly Cookie)
                                              v
+-----------------------------------------------------------------------------------+
| Express 5 Backend API                                                             |
|                                                                                   |
|  [ RequestID ] -> [ HttpLogger ] -> [ Helmet ] -> [ CORS ] -> [ GlobalRateLimiter] |
|                                       |                                           |
|                                       v                                           |
|                   [ Authentication Middleware (JWT) ]                             |
|                                       |                                           |
|                   [ Authorization Middleware (RBAC) ]                             |
|                                       |                                           |
|                   [ Zod Payload Validation Middleware ]                           |
|                                       |                                           |
|             +-------------------------+-------------------------+                 |
|             |                         |                         |                 |
|      [ Auth Module ]           [ User Module ]           [ Catalog Module ]       |
|             |                         |                         |                 |
|             +-------------------------+-------------------------+                 |
|                                       |                                           |
|                              [ Prisma ORM Pool ]                                  |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
                            +-----------------------+
                            | PostgreSQL Database   |
                            +-----------------------+
```

The system uses a decoupled client-server architecture:
- **Backend**: Micro-service ready monolithic REST API structured in domain modules (`modules/auth`, `modules/users`, `modules/roles`, `modules/products`, etc.).
- **Frontend**: Single Page / SSR App Router frontend built with Next.js 16, using custom hooks, TanStack Query for server state management, and Zustand for global UI state.

---

## Tech Stack

### Backend
- **Core**: Node.js, Express `v5.1.0`, TypeScript `v5.9.3`
- **Database & ORM**: PostgreSQL, Prisma ORM `v7.9.0`
- **Security & Auth**: JsonWebToken (JWT), Bcrypt, Cookie-Parser, Helmet, Cors, Express-Rate-Limit
- **Validation & Processing**: Zod `v4.4.3`, Multer, Sharp (Image processing)
- **Logging & Utilities**: Pino, Pino-HTTP, Pino-Pretty

### Frontend
- **Framework**: Next.js `v16.2.11`, React `v19.2.4`, TypeScript
- **Styling & UI**: TailwindCSS `v4`, Shadcn UI / Base UI, Lucide Icons
- **State & Data Fetching**: TanStack React Query `v5`, Zustand `v5`
- **Forms & Validation**: React Hook Form, Zod

---

## Requirements

- **Node.js**: `>= 20.x` (Recommended: Node 22 LTS or Node 24)
- **Package Manager**: `npm` `>= 10.x`
- **Database**: PostgreSQL `>= 15.x` (or Supabase / Neon Cloud Postgres)

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd "Ecommerce Admin dashboard"
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## Environment Variables

### Backend `.env` (`backend/.env`)

```env
PORT=8080
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# Security Secrets (Must be changed in production)
JWT_ACCESS_SECRET=dev-access-secret-change-this-in-production-min32chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-this-in-production-min32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=dev-cookie-secret-change-this-in-production-min32chars

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Media Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Database Connections
DATABASE_URL="postgresql://user:pass@host:5432/postgres"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
```

### Frontend `.env.local` (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## Database Setup

Ensure your PostgreSQL service is active and reachable via `DATABASE_URL`.

---

## Migration

Run the Prisma migration generator from the `backend` directory to apply the latest database schema:

```bash
cd backend
npm run db:migrate
```

To validate or format your Prisma schema:
```bash
npm run db:format
npm run db:validate
```

---

## Seed

Populate the database with initial permission groups, permissions, roles, super admin credentials, sample categories, brands, attributes, and products:

```bash
cd backend
npm run db:seed
```

*(Note: You can also reset and re-seed the database using `npm run db:reset`)*.

---

## Run Commands

### Development Mode

- **Start Backend**:
  ```bash
  cd backend
  npm run dev
  ```
  *(Backend runs at http://localhost:8080)*

- **Start Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(Frontend runs at http://localhost:3000)*

### Production Mode

- **Build & Start Backend**:
  ```bash
  cd backend
  npm run build
  npm run start
  ```

- **Build & Start Frontend**:
  ```bash
  cd frontend
  npm run build
  npm run start
  ```

### Run Tests

- **Backend Automated Tests**:
  ```bash
  cd backend
  npm run test
  ```

---

## Authentication Strategy

The system enforces a dual-token JWT security model:
1. **Access Token**: Short-lived (15 minutes). Sent in the `Authorization: Bearer <token>` header for API requests. Kept in-memory on the frontend to prevent XSS vulnerability.
2. **Refresh Token**: Long-lived (7 days). Stored securely in an `HttpOnly`, `SameSite=Lax` browser cookie.
3. **Session Rotation & Revocation**: Every token refresh invalidates the previous refresh session in PostgreSQL (`RefreshSession` table) and issues a new pair.
4. **Inactive User Defense**: Even if an access token is cryptographically valid, every authenticated request performs a database lookup to ensure the user status is active (`status: ACTIVE`). Suspended or deleted users are instantly rejected.

---

## Authorization Strategy

Authorization is governed by dynamic, database-backed Role-Based Access Control (RBAC):
- **Permission Key Pattern**: Format `module:action` (e.g. `users:read`, `users:create`, `products:delete`, `media:create`).
- **Dynamic Check**: When a user hits an endpoint decorated with `authorize('permission:key')`, the backend verifies that the user's assigned Role currently has a matching `RolePermission` record in the database.
- **Immediate Effect**: Granting or revoking permissions from a role takes effect instantly across all active user sessions without requiring re-login.

---

## Seed Credentials

For development and evaluation purposes, use the default seeded credentials:

| Role | Email | Password | Permissions Granted |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@example.com` | `Admin123!` | All System Permissions (`*:*`) |
| **Administrator** | *(Create via Super Admin)* | *Configurable* | Full administrative access excluding system role deletion |
| **Catalog Manager** | *(Create via Super Admin)* | *Configurable* | Product, Category, Brand, Attribute, & Media CRUD |
| **Read-Only Staff** | *(Create via Super Admin)* | *Configurable* | Read-only access to products, categories, and media |

---

## API Documentation

Complete API documentation artifacts are available:
- **OpenAPI 3.0 Specification**: [`backend/docs/openapi.json`](file:///f:/Web%20Development/Ecommerce%20Admin%20dashboard/backend/docs/openapi.json)
- **Postman Collection (v2.1)**: [`backend/docs/postman_collection.json`](file:///f:/Web%20Development/Ecommerce%20Admin%20dashboard/backend/docs/postman_collection.json)
- **Markdown API Reference**: [`API_DOCUMENTATION.md`](file:///f:/Web%20Development/Ecommerce%20Admin%20dashboard/API_DOCUMENTATION.md)

---

## Deployment

### Backend Deployment (Docker / Node Server)
1. Set production environment variables in `.env` (Strong `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`).
2. Run build: `npm run build`
3. Execute migrations in production pipeline: `npx prisma migrate deploy`
4. Start application: `npm run start` or via PM2 / Docker container.

### Frontend Deployment (Vercel / Node Server)
1. Configure `NEXT_PUBLIC_API_URL` pointing to the public backend domain.
2. Build frontend bundle: `npm run build`
3. Start production server: `npm run start`

---

## Known Issues

- **Cookie SameSite Cross-Domain**: When deploying frontend and backend on distinct root domains, `SameSite=None; Secure` must be set in cookie configuration for refresh cookies to persist across cross-site requests.
- **File Storage Driver**: The current implementation stores uploaded media locally under `public/uploads`. For multi-server or containerized cloud deployments, an AWS S3 / Cloudflare R2 storage driver module can replace local disk writes.