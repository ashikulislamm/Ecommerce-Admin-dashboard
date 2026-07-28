import { PrismaClient } from '../../src/generated/prisma/index.js';

export const seedRoles = async (prisma: PrismaClient) => {
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system access' },
    { name: 'ADMIN', description: 'Administrative access' },
    { name: 'MANAGER', description: 'Catalog and product management' },
    { name: 'STAFF', description: 'Read-only staff access' },
  ];

  const roleMap = new Map<string, string>();

  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleMap.set(role.name, record.id);
  }

  console.log(`  ✓ Seeded ${roles.length} Roles`);
  return roleMap;
};
