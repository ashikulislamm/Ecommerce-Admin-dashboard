import { PrismaClient, UserStatus } from '../../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

export const seedUsers = async (
  prisma: PrismaClient,
  roleMap: Map<string, string>
) => {
  const superAdminRoleId = roleMap.get('SUPER_ADMIN');
  if (!superAdminRoleId) {
    throw new Error('SUPER_ADMIN role not found');
  }

  // Securely hash initial dev password
  const passwordHash = bcrypt.hashSync('Admin123!', 10);

  const users = [
    {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: superAdminRoleId,
      status: UserStatus.ACTIVE,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        status: user.status,
      },
      create: user,
    });
  }

  console.log(`  ✓ Seeded ${users.length} Development User(s)`);
};
