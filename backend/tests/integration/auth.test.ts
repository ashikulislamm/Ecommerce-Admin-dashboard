import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { hashPassword } from '../../src/utils/password.js';

describe('Phase 4 & 5 Authentication & Authorization Integration Tests', () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;
  let adminRoleId: string;
  let managerRoleId: string;
  let activeUserId: string;
  let inactiveUserId: string;

  before(async () => {
    server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `http://localhost:${port}/api/v1`;

    // Fetch roles from database (seeded in Phase 2)
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    const managerRole = await prisma.role.findUnique({ where: { name: 'MANAGER' } });

    assert.ok(superAdminRole, 'SUPER_ADMIN role must exist from seeding');
    assert.ok(managerRole, 'MANAGER role must exist from seeding');

    adminRoleId = superAdminRole.id;
    managerRoleId = managerRole.id;

    // Create test active user
    const passwordHash = await hashPassword('Password123!');

    const activeUser = await prisma.user.upsert({
      where: { email: 'authtest.active@example.com' },
      update: { passwordHash, status: 'ACTIVE', roleId: adminRoleId },
      create: {
        email: 'authtest.active@example.com',
        passwordHash,
        firstName: 'Active',
        lastName: 'Tester',
        roleId: adminRoleId,
        status: 'ACTIVE',
      },
    });
    activeUserId = activeUser.id;

    // Create test inactive user
    const inactiveUser = await prisma.user.upsert({
      where: { email: 'authtest.inactive@example.com' },
      update: { passwordHash, status: 'INACTIVE', roleId: adminRoleId },
      create: {
        email: 'authtest.inactive@example.com',
        passwordHash,
        firstName: 'Inactive',
        lastName: 'Tester',
        roleId: adminRoleId,
        status: 'INACTIVE',
      },
    });
    inactiveUserId = inactiveUser.id;
  });

  after(async () => {
    // Clean up test users and refresh sessions
    await prisma.refreshSession.deleteMany({
      where: { userId: { in: [activeUserId, inactiveUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [activeUserId, inactiveUserId] } },
    });
    server.close();
  });

  // --- 1. LOGIN TESTS ---

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials and return access token + HttpOnly cookie', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.active@example.com',
          password: 'Password123!',
        }),
      });

      assert.equal(res.status, 200);

      const json = (await res.json()) as {
        success: boolean;
        message: string;
        data: { accessToken: string; user: { email: string; roleName: string } };
      };

      assert.equal(json.success, true);
      assert.ok(json.data.accessToken);
      assert.equal(json.data.user.email, 'authtest.active@example.com');
      assert.equal(json.data.user.roleName, 'SUPER_ADMIN');

      // Verify Set-Cookie header contains refreshToken
      const cookieHeader = res.headers.get('set-cookie');
      assert.ok(cookieHeader);
      assert.ok(cookieHeader.includes('refreshToken='));
      assert.ok(cookieHeader.includes('HttpOnly'));
    });

    it('should reject login with non-existent email with 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      });

      assert.equal(res.status, 401);
      const json = (await res.json()) as { success: boolean; error: { code: string } };
      assert.equal(json.success, false);
      assert.equal(json.error.code, 'AUTH_INVALID_CREDENTIALS');
    });

    it('should reject login with invalid password with 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.active@example.com',
          password: 'WrongPassword!',
        }),
      });

      assert.equal(res.status, 401);
      const json = (await res.json()) as { success: boolean; error: { code: string } };
      assert.equal(json.success, false);
      assert.equal(json.error.code, 'AUTH_INVALID_CREDENTIALS');
    });

    it('should reject login for INACTIVE user with 401 AUTH_USER_INACTIVE', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.inactive@example.com',
          password: 'Password123!',
        }),
      });

      assert.equal(res.status, 401);
      const json = (await res.json()) as { success: boolean; error: { code: string } };
      assert.equal(json.success, false);
      assert.equal(json.error.code, 'AUTH_USER_INACTIVE');
    });
  });

  // --- 2. AUTHENTICATION & AUTHORIZATION PIPELINE TESTS ---

  describe('Protected Routes & Authorization', () => {
    let accessToken: string;

    before(async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.active@example.com',
          password: 'Password123!',
        }),
      });
      const json = (await res.json()) as { data: { accessToken: string } };
      accessToken = json.data.accessToken;
    });

    it('should return 401 for protected endpoint with missing Authorization header', async () => {
      const res = await fetch(`${baseUrl}/test/protected`);
      assert.equal(res.status, 401);
      const json = (await res.json()) as { error: { code: string } };
      assert.equal(json.error.code, 'UNAUTHORIZED');
    });

    it('should return 401 for protected endpoint with malformed Authorization header', async () => {
      const res = await fetch(`${baseUrl}/test/protected`, {
        headers: { Authorization: 'Basic xyz123' },
      });
      assert.equal(res.status, 401);
    });

    it('should return 401 for invalid JWT token', async () => {
      const res = await fetch(`${baseUrl}/test/protected`, {
        headers: { Authorization: 'Bearer invalid.jwt.token' },
      });
      assert.equal(res.status, 401);
      const json = (await res.json()) as { error: { code: string } };
      assert.equal(json.error.code, 'TOKEN_INVALID');
    });

    it('should allow access to protected route with valid Bearer access token', async () => {
      const res = await fetch(`${baseUrl}/test/protected`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.equal(res.status, 200);
      const json = (await res.json()) as { success: boolean; data: { user: { email: string } } };
      assert.equal(json.success, true);
      assert.equal(json.data.user.email, 'authtest.active@example.com');
    });

    it('should allow SUPER_ADMIN access to permission-protected route (/test/product-access)', async () => {
      const res = await fetch(`${baseUrl}/test/product-access`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.equal(res.status, 200);
      const json = (await res.json()) as { success: boolean };
      assert.equal(json.success, true);
    });

    it('should return GET /auth/session with active user and dynamic permissions', async () => {
      const res = await fetch(`${baseUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.equal(res.status, 200);
      const json = (await res.json()) as {
        success: boolean;
        data: { user: { email: string }; permissions: string[] };
      };

      assert.equal(json.success, true);
      assert.equal(json.data.user.email, 'authtest.active@example.com');
      assert.ok(Array.isArray(json.data.permissions));
      assert.ok(json.data.permissions.length > 0);
    });
  });

  // --- 3. REFRESH & ROTATION TESTS ---

  describe('POST /api/v1/auth/refresh & Logout', () => {
    it('should refresh access token, rotate refresh token cookie, and revoke old session', async () => {
      // 1. Login to get cookie
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.active@example.com',
          password: 'Password123!',
        }),
      });

      const initialCookie = loginRes.headers.get('set-cookie');
      assert.ok(initialCookie);

      // 2. Refresh token using cookie
      const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: initialCookie },
      });

      assert.equal(refreshRes.status, 200);
      const refreshJson = (await refreshRes.json()) as {
        success: boolean;
        data: { accessToken: string };
      };
      assert.ok(refreshJson.data.accessToken);

      const rotatedCookie = refreshRes.headers.get('set-cookie');
      assert.ok(rotatedCookie);
      assert.notEqual(rotatedCookie, initialCookie, 'Rotated cookie must differ from initial cookie');

      // 3. REUSE DETECTION: Attempting to use the OLD (revoked) initial cookie must be rejected with 401
      const reuseRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: initialCookie },
      });

      assert.equal(reuseRes.status, 401);
      const reuseJson = (await reuseRes.json()) as { error: { code: string } };
      assert.equal(reuseJson.error.code, 'AUTH_REFRESH_TOKEN_REUSED');
    });

    it('should logout cleanly, revoke session, and clear cookie', async () => {
      // 1. Login
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'authtest.active@example.com',
          password: 'Password123!',
        }),
      });

      const cookie = loginRes.headers.get('set-cookie');
      assert.ok(cookie);

      // 2. Logout
      const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { Cookie: cookie },
      });

      assert.equal(logoutRes.status, 200);

      // Verify cookie cleared
      const logoutCookie = logoutRes.headers.get('set-cookie');
      assert.ok(logoutCookie);
      assert.ok(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires=Thu, 01 Jan 1970'));

      // 3. Attempting to refresh after logout must fail
      const postLogoutRefresh = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: cookie },
      });

      assert.equal(postLogoutRefresh.status, 401);
    });
  });
});
