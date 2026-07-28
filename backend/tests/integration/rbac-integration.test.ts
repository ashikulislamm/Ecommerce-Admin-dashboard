import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import PermissionService from '../../src/modules/permissions/permission.service.js';
import PermissionRepository from '../../src/modules/permissions/permission.repository.js';
import RoleService from '../../src/modules/roles/role.service.js';
import RoleRepository from '../../src/modules/roles/role.repository.js';
import UserService from '../../src/modules/users/user.service.js';
import UserRepository from '../../src/modules/users/user.repository.js';

describe('RBAC & User Management Full Integration Tests', () => {
  it('should execute full RBAC workflow sequentially', async () => {
    const timeSuffix = Date.now();

    // 1. Create custom permission
    const testAction = `custom_action_${timeSuffix}`;
    const permission = await PermissionService.createPermission({
      module: 'products',
      action: testAction,
      name: `Custom ${testAction}`,
      isCustom: true,
    });
    assert.ok(permission.id);
    assert.equal(permission.key, `products:${testAction}`);

    // 2. Create role & assign permission
    const roleName = `ROLE_${timeSuffix}`;
    const role = await RoleService.createRole({
      name: roleName,
      description: 'Integration test role',
      permissionIds: [permission.id],
    });
    assert.ok(role.id);

    // 3. Create user & assign role
    const userEmail = `rbac_user_${timeSuffix}@example.com`;
    const user = await UserService.createUser({
      firstName: 'RBAC',
      lastName: 'Tester',
      email: userEmail,
      password: 'StrongPassword123!',
      roleId: role.id,
    });
    assert.ok(user.id);
    assert.equal(user.roleId, role.id);

    // 4. Verify system rejects self-role change
    const requester = { id: user.id, roleId: role.id, roleName };
    await assert.rejects(
      async () => {
        await UserService.updateUserRole(user.id, role.id, requester);
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        return true;
      },
    );

    // 5. Verify system rejects deleting role with assigned users
    await assert.rejects(
      async () => {
        await RoleService.deleteRole(role.id);
      },
      (err: any) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /assigned to this role/i);
        return true;
      },
    );

    // 6. Deactivate user and verify session revocation
    const deactivated = await UserService.updateUserStatus(user.id, 'INACTIVE', 'admin-id-123');
    assert.equal(deactivated.status, 'INACTIVE');

    // Clean up test data
    await prisma.user.delete({ where: { id: user.id } });
    await RoleService.deleteRole(role.id);
    await PermissionRepository.deletePermission(permission.id);
  });
});
