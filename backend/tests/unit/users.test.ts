import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UserService from '../../src/modules/users/user.service.js';
import UserRepository from '../../src/modules/users/user.repository.js';
import RoleRepository from '../../src/modules/roles/role.repository.js';

describe('Phase 8 — User Management Security Unit Tests', () => {
  it('should create a user and hash password securely', async () => {
    const testEmail = `user_test_${Date.now()}@example.com`;
    const adminRole = await RoleRepository.findByName('ADMIN');
    assert.ok(adminRole, 'ADMIN role should exist');

    const user = await UserService.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'SecurePassword123!',
      roleId: adminRole.id,
    });

    assert.ok(user.id);
    assert.equal(user.email, testEmail);
    // Password hash should NEVER be present in user response
    assert.equal((user as any).passwordHash, undefined);

    // Clean up
    await UserRepository.softDeleteUser(user.id);
  });

  it('should prevent self role change (403 Forbidden)', async () => {
    const adminRole = await RoleRepository.findByName('ADMIN');
    assert.ok(adminRole);

    const requester = {
      id: 'self-user-id-123',
      roleId: adminRole.id,
      roleName: 'ADMIN',
    };

    await assert.rejects(
      async () => {
        await UserService.updateUserRole('self-user-id-123', adminRole.id, requester);
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot change your own role/i);
        return true;
      },
    );
  });

  it('should prevent self deactivation and self deletion (403 Forbidden)', async () => {
    const selfId = 'self-user-id-999';

    await assert.rejects(
      async () => {
        await UserService.updateUserStatus(selfId, 'INACTIVE', selfId);
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot deactivate your own account/i);
        return true;
      },
    );

    await assert.rejects(
      async () => {
        await UserService.deleteUser(selfId, selfId);
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot delete your own account/i);
        return true;
      },
    );
  });

  it('should revoke all refresh sessions immediately when user is deactivated', async () => {
    const testEmail = `session_test_${Date.now()}@example.com`;
    const staffRole = await RoleRepository.findByName('STAFF');
    assert.ok(staffRole);

    const user = await UserService.createUser({
      email: testEmail,
      password: 'Password123!',
      roleId: staffRole.id,
    });

    try {
      const updated = await UserService.updateUserStatus(user.id, 'INACTIVE', 'other-admin-id');
      assert.equal(updated.status, 'INACTIVE');
    } finally {
      await UserRepository.softDeleteUser(user.id);
    }
  });
});
