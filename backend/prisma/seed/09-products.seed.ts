import {
  PrismaClient,
  ProductType,
  ProductStatus,
  VariantStatus,
} from '../../src/generated/prisma/index.js';

export const seedProducts = async (
  prisma: PrismaClient,
  categoryMap: Map<string, string>,
  brandMap: Map<string, string>,
  attributeValueMap: Map<string, string>
) => {
  const appleBrandId = brandMap.get('apple');
  const dellBrandId = brandMap.get('dell');
  const mobileCategoryId = categoryMap.get('mobile');
  const laptopCategoryId = categoryMap.get('laptop');

  // Product 1: Smartphone X
  const product1 = await prisma.product.upsert({
    where: { sku: 'SMARTPHONE-X' },
    update: {
      name: 'Smartphone X',
      slug: 'smartphone-x',
      description: 'Flagship smartphone with high-end display.',
      brandId: appleBrandId,
      productType: ProductType.VARIABLE,
      status: ProductStatus.ACTIVE,
    },
    create: {
      name: 'Smartphone X',
      slug: 'smartphone-x',
      sku: 'SMARTPHONE-X',
      description: 'Flagship smartphone with high-end display.',
      brandId: appleBrandId,
      productType: ProductType.VARIABLE,
      status: ProductStatus.ACTIVE,
    },
  });

  if (mobileCategoryId) {
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product1.id,
          categoryId: mobileCategoryId,
        },
      },
      update: {},
      create: {
        productId: product1.id,
        categoryId: mobileCategoryId,
      },
    });
  }

  // Variants for Product 1
  const v1 = await prisma.productVariant.upsert({
    where: { sku: 'SMARTPHONE-X-BLK-128' },
    update: {
      price: 999.99,
      stockQuantity: 50,
      status: VariantStatus.ACTIVE,
    },
    create: {
      productId: product1.id,
      sku: 'SMARTPHONE-X-BLK-128',
      price: 999.99,
      compareAtPrice: 1099.99,
      stockQuantity: 50,
      status: VariantStatus.ACTIVE,
    },
  });

  const blackValId = attributeValueMap.get('color:Black');
  const storage128ValId = attributeValueMap.get('storage:128GB');

  if (blackValId) {
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeValueId: { variantId: v1.id, attributeValueId: blackValId } },
      update: {},
      create: { variantId: v1.id, attributeValueId: blackValId },
    });
  }
  if (storage128ValId) {
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeValueId: { variantId: v1.id, attributeValueId: storage128ValId } },
      update: {},
      create: { variantId: v1.id, attributeValueId: storage128ValId },
    });
  }

  // Product 2: Pro Laptop 15
  const product2 = await prisma.product.upsert({
    where: { sku: 'LAPTOP-PRO-15' },
    update: {
      name: 'Pro Laptop 15',
      slug: 'laptop-pro-15',
      description: 'High performance laptop for professionals.',
      brandId: dellBrandId,
      productType: ProductType.VARIABLE,
      status: ProductStatus.ACTIVE,
    },
    create: {
      name: 'Pro Laptop 15',
      slug: 'laptop-pro-15',
      sku: 'LAPTOP-PRO-15',
      description: 'High performance laptop for professionals.',
      brandId: dellBrandId,
      productType: ProductType.VARIABLE,
      status: ProductStatus.ACTIVE,
    },
  });

  if (laptopCategoryId) {
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product2.id,
          categoryId: laptopCategoryId,
        },
      },
      update: {},
      create: {
        productId: product2.id,
        categoryId: laptopCategoryId,
      },
    });
  }

  const v2 = await prisma.productVariant.upsert({
    where: { sku: 'LAPTOP-PRO-15-SLV-512' },
    update: {
      price: 1499.99,
      stockQuantity: 25,
      status: VariantStatus.ACTIVE,
    },
    create: {
      productId: product2.id,
      sku: 'LAPTOP-PRO-15-SLV-512',
      price: 1499.99,
      compareAtPrice: 1699.99,
      stockQuantity: 25,
      status: VariantStatus.ACTIVE,
    },
  });

  const whiteValId = attributeValueMap.get('color:White');
  const storage512ValId = attributeValueMap.get('storage:512GB');
  const ram16ValId = attributeValueMap.get('ram:16GB');

  if (whiteValId) {
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeValueId: { variantId: v2.id, attributeValueId: whiteValId } },
      update: {},
      create: { variantId: v2.id, attributeValueId: whiteValId },
    });
  }
  if (storage512ValId) {
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeValueId: { variantId: v2.id, attributeValueId: storage512ValId } },
      update: {},
      create: { variantId: v2.id, attributeValueId: storage512ValId },
    });
  }
  if (ram16ValId) {
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeValueId: { variantId: v2.id, attributeValueId: ram16ValId } },
      update: {},
      create: { variantId: v2.id, attributeValueId: ram16ValId },
    });
  }

  console.log(`  ✓ Seeded Products & Product Variants`);
  return { product1, product2, v1, v2 };
};
