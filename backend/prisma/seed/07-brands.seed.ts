import { PrismaClient, BrandStatus } from '../../src/generated/prisma/index.js';

export const seedBrands = async (prisma: PrismaClient) => {
  const brands = [
    { name: 'Apple', slug: 'apple', description: 'Apple Inc. products' },
    { name: 'Samsung', slug: 'samsung', description: 'Samsung Electronics' },
    { name: 'Dell', slug: 'dell', description: 'Dell Technologies' },
    { name: 'Nike', slug: 'nike', description: 'Nike Sports' },
  ];

  const brandMap = new Map<string, string>();

  for (const brand of brands) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, description: brand.description },
      create: { ...brand, status: BrandStatus.ACTIVE },
    });
    brandMap.set(brand.slug, record.id);
  }

  console.log(`  ✓ Seeded ${brands.length} Brands`);
  return brandMap;
};
