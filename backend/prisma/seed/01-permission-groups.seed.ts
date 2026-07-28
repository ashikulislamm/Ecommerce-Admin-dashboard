import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedPermissionGroups = async (prisma: PrismaClient) => {
  const groups = [
    { name: 'Users', description: 'User management permissions' },
    { name: 'Roles', description: 'Role management permissions' },
    { name: 'Permissions', description: 'Permission management permissions' },
    { name: 'Products', description: 'Product catalog permissions' },
    { name: 'Categories', description: 'Category management permissions' },
    { name: 'Brands', description: 'Brand management permissions' },
    { name: 'Attributes', description: 'Attribute management permissions' },
    { name: 'Media', description: 'Media asset permissions' },
    { name: 'Settings', description: 'System settings permissions' },
  ];

  const groupMap = new Map<string, string>();

  for (const group of groups) {
    const record = await prisma.permissionGroup.upsert({
      where: { name: group.name },
      update: { description: group.description },
      create: group,
    });
    groupMap.set(group.name, record.id);
  }

  console.log(`  ✓ Seeded ${groups.length} Permission Groups`);
  return groupMap;
};
