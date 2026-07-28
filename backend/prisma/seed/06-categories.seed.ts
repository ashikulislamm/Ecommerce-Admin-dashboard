import { PrismaClient, CategoryStatus } from '../../src/generated/prisma/index.js';

export const seedCategories = async (prisma: PrismaClient) => {
  const categoryMap = new Map<string, string>();

  // 1. Root categories
  const rootCategories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets and electronic items', sortOrder: 1 },
    { name: 'Fashion', slug: 'fashion', description: 'Apparel and fashion items', sortOrder: 2 },
  ];

  for (const cat of rootCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: { ...cat, status: CategoryStatus.ACTIVE },
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 2. Child categories
  const electronicsId = categoryMap.get('electronics');
  const fashionId = categoryMap.get('fashion');

  const childCategories = [
    { name: 'Mobile', slug: 'mobile', description: 'Smartphones & mobile devices', parentId: electronicsId, sortOrder: 1 },
    { name: 'Laptop', slug: 'laptop', description: 'Computers & laptops', parentId: electronicsId, sortOrder: 2 },
    { name: 'Accessories', slug: 'accessories', description: 'Electronic accessories', parentId: electronicsId, sortOrder: 3 },
    { name: 'Men', slug: 'men', description: 'Men apparel', parentId: fashionId, sortOrder: 1 },
    { name: 'Women', slug: 'women', description: 'Women apparel', parentId: fashionId, sortOrder: 2 },
  ];

  for (const cat of childCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, parentId: cat.parentId, sortOrder: cat.sortOrder },
      create: { ...cat, status: CategoryStatus.ACTIVE },
    });
    categoryMap.set(cat.slug, record.id);
  }

  console.log(`  ✓ Seeded ${rootCategories.length + childCategories.length} Categories (Hierarchical)`);
  return categoryMap;
};
