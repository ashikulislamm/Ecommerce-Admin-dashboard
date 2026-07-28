import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import PermissionService from '../../src/modules/permissions/permission.service.js';
import PermissionRepository from '../../src/modules/permissions/permission.repository.js';
import { AppError } from '../../src/shared/errors/app-error.js';

describe('Phase 6 — Permission Management Unit Tests', () => {
  it('should validate permission key format correctly', async () => {
    const invalidKeys = [
      { module: 'invalid module', action: 'create' },
      { module: 'test_module', action: 'create extra' },
      { module: '123test', action: 'create' },
      { module: 'test_module', action: 'create!' },
    ];

    for (const item of invalidKeys) {
      await assert.rejects(
        async () => {
          await PermissionService.createPermission({
            module: item.module,
            action: item.action,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          return true;
        },
      );
    }
  });

  it('should create a valid custom permission', async () => {
    const testAction = `unit_test_${Date.now()}`;
    const perm = await PermissionService.createPermission({
      module: 'products',
      action: testAction,
      name: `Custom ${testAction}`,
      description: 'Unit test custom action',
      isCustom: true,
    });

    assert.ok(perm.id);
    assert.equal(perm.key, `products:${testAction}`);
    assert.equal(perm.isCustom, true);

    // Clean up
    await PermissionRepository.deletePermission(perm.id);
  });

  it('should reject duplicate permission creation with 409 Conflict', async () => {
    const testAction = `dupe_${Date.now()}`;
    const perm = await PermissionService.createPermission({
      module: 'products',
      action: testAction,
    });

    try {
      await assert.rejects(
        async () => {
          await PermissionService.createPermission({
            module: 'products',
            action: testAction,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /already exists/i);
          return true;
        },
      );
    } finally {
      await PermissionRepository.deletePermission(perm.id);
    }
  });

  it('should retrieve permissions with pagination and filtering', async () => {
    const res = await PermissionService.getPermissions({
      page: 1,
      limit: 10,
      module: 'products',
    });

    assert.equal(res.page, 1);
    assert.equal(res.limit, 10);
    assert.ok(Array.isArray(res.items));
    assert.ok(res.total >= 0);
  });

  it('should prevent deleting a permission if assigned to roles (409 Conflict)', async () => {
    // Look for existing seeded permission that is assigned to roles (e.g. products:read)
    const seeded = await PermissionRepository.findByKey('products:read');
    assert.ok(seeded, 'Seeded permission products:read should exist');

    await assert.rejects(
      async () => {
        await PermissionService.deletePermission(seeded.id);
      },
      (err: any) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /assigned to/i);
        return true;
      },
    );
  });
});
