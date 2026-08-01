import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedPermissionGroups = async (prisma: PrismaClient) => {
  const groups = [
    { name: 'Users', module: 'users', description: 'User management permissions' },
    { name: 'Roles', module: 'roles', description: 'Role management permissions' },
    { name: 'Permissions', module: 'permissions', description: 'Permission management permissions' },
    { name: 'Products', module: 'products', description: 'Product catalog permissions' },
    { name: 'Categories', module: 'categories', description: 'Category management permissions' },
    { name: 'Brands', module: 'brands', description: 'Brand management permissions' },
    { name: 'Attributes', module: 'attributes', description: 'Attribute management permissions' },
    { name: 'Media', module: 'media', description: 'Media asset permissions' },
    { name: 'Settings', module: 'settings', description: 'System settings permissions' },
  ];

  const groupMap = new Map<string, string>();

  for (const group of groups) {
    const record = await prisma.permissionGroup.upsert({
      where: { module: group.module },
      update: { name: group.name, description: group.description },
      create: group,
    });
    groupMap.set(group.module, record.id);
  }

  // Cleanup routine: remove any duplicate singular "product" group and permissions
  const singularGroup = await prisma.permissionGroup.findUnique({
    where: { module: 'product' },
    include: { permissions: true },
  });

  if (singularGroup) {
    const permIds = singularGroup.permissions.map((p) => p.id);
    if (permIds.length > 0) {
      await prisma.rolePermission.deleteMany({
        where: { permissionId: { in: permIds } },
      });
      await prisma.permission.deleteMany({
        where: { id: { in: permIds } },
      });
    }
    await prisma.permissionGroup.delete({
      where: { id: singularGroup.id },
    });
    console.log('  ✓ Cleaned up duplicate singular "product" permission group & permissions');
  }

  console.log(`  ✓ Seeded ${groups.length} Permission Groups`);
  return groupMap;
};
