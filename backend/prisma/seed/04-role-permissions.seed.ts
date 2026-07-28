import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedRolePermissions = async (
  prisma: PrismaClient,
  roleMap: Map<string, string>,
  permissionMap: Map<string, string>
) => {
  const allPermissionNames = Array.from(permissionMap.keys());

  const rolePermissionAssignments: Record<string, string[]> = {
    SUPER_ADMIN: allPermissionNames,
    ADMIN: allPermissionNames.filter((p) => !p.startsWith('roles.delete')),
    MANAGER: [
      'products.read',
      'products.create',
      'products.update',
      'categories.read',
      'categories.create',
      'categories.update',
      'brands.read',
      'brands.create',
      'brands.update',
      'attributes.read',
      'attributes.create',
      'attributes.update',
      'media.read',
      'media.create',
    ],
    STAFF: [
      'products.read',
      'categories.read',
      'brands.read',
      'attributes.read',
      'media.read',
    ],
  };

  const recordsToInsert: Array<{ roleId: string; permissionId: string }> = [];

  for (const [roleName, permNames] of Object.entries(rolePermissionAssignments)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const permName of permNames) {
      const permissionId = permissionMap.get(permName);
      if (!permissionId) continue;

      recordsToInsert.push({ roleId, permissionId });
    }
  }

  if (recordsToInsert.length > 0) {
    await prisma.rolePermission.createMany({
      data: recordsToInsert,
      skipDuplicates: true,
    });
  }

  console.log(`  ✓ Seeded ${recordsToInsert.length} Role-Permission Mappings`);
};
