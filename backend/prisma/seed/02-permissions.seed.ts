import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedPermissions = async (
  prisma: PrismaClient,
  groupMap: Map<string, string>
) => {
  const permissionsList = [
    // Users
    { key: 'users:read', module: 'users', action: 'read', name: 'Read Users', description: 'View users', groupModule: 'users' },
    { key: 'users:create', module: 'users', action: 'create', name: 'Create Users', description: 'Create users', groupModule: 'users' },
    { key: 'users:update', module: 'users', action: 'update', name: 'Update Users', description: 'Update users', groupModule: 'users' },
    { key: 'users:delete', module: 'users', action: 'delete', name: 'Delete Users', description: 'Delete users', groupModule: 'users' },
    // Roles
    { key: 'roles:read', module: 'roles', action: 'read', name: 'Read Roles', description: 'View roles', groupModule: 'roles' },
    { key: 'roles:create', module: 'roles', action: 'create', name: 'Create Roles', description: 'Create roles', groupModule: 'roles' },
    { key: 'roles:update', module: 'roles', action: 'update', name: 'Update Roles', description: 'Update roles', groupModule: 'roles' },
    { key: 'roles:delete', module: 'roles', action: 'delete', name: 'Delete Roles', description: 'Delete roles', groupModule: 'roles' },
    // Permissions
    { key: 'permissions:read', module: 'permissions', action: 'read', name: 'Read Permissions', description: 'View permissions', groupModule: 'permissions' },
    { key: 'permissions:create', module: 'permissions', action: 'create', name: 'Create Permissions', description: 'Create permissions', groupModule: 'permissions' },
    { key: 'permissions:update', module: 'permissions', action: 'update', name: 'Update Permissions', description: 'Update permissions', groupModule: 'permissions' },
    { key: 'permissions:delete', module: 'permissions', action: 'delete', name: 'Delete Permissions', description: 'Delete permissions', groupModule: 'permissions' },
    // Products
    { key: 'products:read', module: 'products', action: 'read', name: 'Read Products', description: 'View products', groupModule: 'products' },
    { key: 'products:create', module: 'products', action: 'create', name: 'Create Products', description: 'Create products', groupModule: 'products' },
    { key: 'products:update', module: 'products', action: 'update', name: 'Update Products', description: 'Update products', groupModule: 'products' },
    { key: 'products:delete', module: 'products', action: 'delete', name: 'Delete Products', description: 'Delete products', groupModule: 'products' },
    // Categories
    { key: 'categories:read', module: 'categories', action: 'read', name: 'Read Categories', description: 'View categories', groupModule: 'categories' },
    { key: 'categories:create', module: 'categories', action: 'create', name: 'Create Categories', description: 'Create categories', groupModule: 'categories' },
    { key: 'categories:update', module: 'categories', action: 'update', name: 'Update Categories', description: 'Update categories', groupModule: 'categories' },
    { key: 'categories:delete', module: 'categories', action: 'delete', name: 'Delete Categories', description: 'Delete categories', groupModule: 'categories' },
    // Brands
    { key: 'brands:read', module: 'brands', action: 'read', name: 'Read Brands', description: 'View brands', groupModule: 'brands' },
    { key: 'brands:create', module: 'brands', action: 'create', name: 'Create Brands', description: 'Create brands', groupModule: 'brands' },
    { key: 'brands:update', module: 'brands', action: 'update', name: 'Update Brands', description: 'Update brands', groupModule: 'brands' },
    { key: 'brands:delete', module: 'brands', action: 'delete', name: 'Delete Brands', description: 'Delete brands', groupModule: 'brands' },
    // Attributes
    { key: 'attributes:read', module: 'attributes', action: 'read', name: 'Read Attributes', description: 'View attributes', groupModule: 'attributes' },
    { key: 'attributes:create', module: 'attributes', action: 'create', name: 'Create Attributes', description: 'Create attributes', groupModule: 'attributes' },
    { key: 'attributes:update', module: 'attributes', action: 'update', name: 'Update Attributes', description: 'Update attributes', groupModule: 'attributes' },
    { key: 'attributes:delete', module: 'attributes', action: 'delete', name: 'Delete Attributes', description: 'Delete attributes', groupModule: 'attributes' },
    // Media
    { key: 'media:read', module: 'media', action: 'read', name: 'Read Media', description: 'View media', groupModule: 'media' },
    { key: 'media:create', module: 'media', action: 'create', name: 'Create Media', description: 'Create media', groupModule: 'media' },
    { key: 'media:update', module: 'media', action: 'update', name: 'Update Media', description: 'Update media', groupModule: 'media' },
    { key: 'media:delete', module: 'media', action: 'delete', name: 'Delete Media', description: 'Delete media', groupModule: 'media' },
  ];

  const permissionMap = new Map<string, string>();

  for (const perm of permissionsList) {
    const groupId = groupMap.get(perm.groupModule);
    if (!groupId) {
      throw new Error(`Permission Group module ${perm.groupModule} not found`);
    }

    const record = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        name: perm.name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
        isCustom: false,
        permissionGroupId: groupId,
      },
      create: {
        key: perm.key,
        name: perm.name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
        isCustom: false,
        permissionGroupId: groupId,
      },
    });

    permissionMap.set(perm.key, record.id);
  }

  console.log(`  ✓ Seeded ${permissionsList.length} Permissions`);
  return permissionMap;
};
