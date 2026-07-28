import prisma from '../src/lib/prisma.js';
import { seedPermissionGroups } from './seed/01-permission-groups.seed.js';
import { seedPermissions } from './seed/02-permissions.seed.js';
import { seedRoles } from './seed/03-roles.seed.js';
import { seedRolePermissions } from './seed/04-role-permissions.seed.js';
import { seedUsers } from './seed/05-users.seed.js';
import { seedCategories } from './seed/06-categories.seed.js';
import { seedBrands } from './seed/07-brands.seed.js';
import { seedAttributes } from './seed/08-attributes.seed.js';
import { seedProducts } from './seed/09-products.seed.js';
import { seedMedia } from './seed/10-media.seed.js';

async function main() {
  console.log('🌱 Starting Database Seed Process...');
  const startTime = Date.now();

  try {
    // 1. Permission Groups
    const groupMap = await seedPermissionGroups(prisma);

    // 2. Permissions
    const permissionMap = await seedPermissions(prisma, groupMap);

    // 3. Roles
    const roleMap = await seedRoles(prisma);

    // 4. Role Permissions
    await seedRolePermissions(prisma, roleMap, permissionMap);

    // 5. Users
    await seedUsers(prisma, roleMap);

    // 6. Categories
    const categoryMap = await seedCategories(prisma);

    // 7. Brands
    const brandMap = await seedBrands(prisma);

    // 8. Attributes & Attribute Values
    const attributeValueMap = await seedAttributes(prisma);

    // 9. Products & Product Variants
    const { product1, v1 } = await seedProducts(
      prisma,
      categoryMap,
      brandMap,
      attributeValueMap
    );

    // 10. Media Metadata & Product/Variant Media
    await seedMedia(prisma, product1.id, v1.id);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Database seeding completed successfully in ${duration}s!`);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();