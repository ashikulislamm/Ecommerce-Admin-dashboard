import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedPermissions = async (
  prisma: PrismaClient,
  groupMap: Map<string, string>
) => {
  const permissionsList = [
    // Users
    { name: 'users.read', description: 'View users', group: 'Users' },
    { name: 'users.create', description: 'Create users', group: 'Users' },
    { name: 'users.update', description: 'Update users', group: 'Users' },
    { name: 'users.delete', description: 'Delete users', group: 'Users' },
    // Roles
    { name: 'roles.read', description: 'View roles', group: 'Roles' },
    { name: 'roles.create', description: 'Create roles', group: 'Roles' },
    { name: 'roles.update', description: 'Update roles', group: 'Roles' },
    { name: 'roles.delete', description: 'Delete roles', group: 'Roles' },
    // Permissions
    { name: 'permissions.read', description: 'View permissions', group: 'Permissions' },
    { name: 'permissions.create', description: 'Create permissions', group: 'Permissions' },
    { name: 'permissions.update', description: 'Update permissions', group: 'Permissions' },
    { name: 'permissions.delete', description: 'Delete permissions', group: 'Permissions' },
    // Products
    { name: 'products.read', description: 'View products', group: 'Products' },
    { name: 'products.create', description: 'Create products', group: 'Products' },
    { name: 'products.update', description: 'Update products', group: 'Products' },
    { name: 'products.delete', description: 'Delete products', group: 'Products' },
    // Categories
    { name: 'categories.read', description: 'View categories', group: 'Categories' },
    { name: 'categories.create', description: 'Create categories', group: 'Categories' },
    { name: 'categories.update', description: 'Update categories', group: 'Categories' },
    { name: 'categories.delete', description: 'Delete categories', group: 'Categories' },
    // Brands
    { name: 'brands.read', description: 'View brands', group: 'Brands' },
    { name: 'brands.create', description: 'Create brands', group: 'Brands' },
    { name: 'brands.update', description: 'Update brands', group: 'Brands' },
    { name: 'brands.delete', description: 'Delete brands', group: 'Brands' },
    // Attributes
    { name: 'attributes.read', description: 'View attributes', group: 'Attributes' },
    { name: 'attributes.create', description: 'Create attributes', group: 'Attributes' },
    { name: 'attributes.update', description: 'Update attributes', group: 'Attributes' },
    { name: 'attributes.delete', description: 'Delete attributes', group: 'Attributes' },
    // Media
    { name: 'media.read', description: 'View media', group: 'Media' },
    { name: 'media.create', description: 'Create media', group: 'Media' },
    { name: 'media.update', description: 'Update media', group: 'Media' },
    { name: 'media.delete', description: 'Delete media', group: 'Media' },
  ];

  const permissionMap = new Map<string, string>();

  for (const perm of permissionsList) {
    const groupId = groupMap.get(perm.group);
    if (!groupId) {
      throw new Error(`Permission Group ${perm.group} not found`);
    }

    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {
        description: perm.description,
        permissionGroupId: groupId,
      },
      create: {
        name: perm.name,
        description: perm.description,
        permissionGroupId: groupId,
      },
    });

    permissionMap.set(perm.name, record.id);
  }

  console.log(`  ✓ Seeded ${permissionsList.length} Permissions`);
  return permissionMap;
};
