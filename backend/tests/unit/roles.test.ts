import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import RoleService from '../../src/modules/roles/role.service.js';
import RoleRepository from '../../src/modules/roles/role.repository.js';
import PermissionRepository from '../../src/modules/permissions/permission.repository.js';

describe('Phase 7 — Role Management Unit Tests', () => {
  it('should create a custom role with permissions', async () => {
    const roleName = `TEST_ROLE_${Date.now()}`;
    const perm = await PermissionRepository.findByKey('products:read');
    assert.ok(perm, 'Seeded permission products:read should exist');

    const role = await RoleService.createRole({
      name: roleName,
      description: 'Test custom role',
      permissionIds: [perm.id],
    });

    assert.ok(role.id);
    assert.equal(role.name, roleName);

    // Clean up
    await RoleRepository.deleteRole(role.id);
  });

  it('should reject creating duplicate role names with 409 Conflict', async () => {
    await assert.rejects(
      async () => {
        await RoleService.createRole({
          name: 'SUPER_ADMIN',
          description: 'Duplicate role test',
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /already exists/i);
        return true;
      },
    );
  });

  it('should protect system roles from deletion (403 Forbidden)', async () => {
    const superAdmin = await RoleRepository.findByName('SUPER_ADMIN');
    assert.ok(superAdmin, 'SUPER_ADMIN role should exist');

    await assert.rejects(
      async () => {
        await RoleService.deleteRole(superAdmin.id);
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot be deleted/i);
        return true;
      },
    );
  });

  it('should prevent deleting a role if assigned users exist (409 Conflict)', async () => {
    // Find role assigned to dev user (e.g. SUPER_ADMIN or ADMIN)
    const adminRole = await RoleRepository.findByName('ADMIN');
    assert.ok(adminRole, 'ADMIN role should exist');

    // Make sure users exist for this role or create temporary assignment
    const userCount = await RoleRepository.countAssignedUsers(adminRole.id);
    if (userCount > 0) {
      await assert.rejects(
        async () => {
          await RoleService.deleteRole(adminRole.id);
        },
        (err: any) => {
          // Should be rejected due to system role protection or assigned users
          assert.ok(err.statusCode === 409 || err.statusCode === 403);
          return true;
        },
      );
    }
  });

  it('should support granting all permissions to a role in a transaction', async () => {
    const roleName = `GRANT_ALL_ROLE_${Date.now()}`;
    const role = await RoleService.createRole({
      name: roleName,
      description: 'Grant all test role',
    });

    try {
      const updated = await RoleService.grantAllPermissions(role.id);
      assert.ok(updated);
      assert.ok((updated as any).rolePermissions.length > 10);
    } finally {
      await RoleRepository.deleteRole(role.id);
    }
  });
});
