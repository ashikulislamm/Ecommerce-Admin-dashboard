import { PrismaClient, MediaType } from '../../src/generated/prisma/index.js';

export const seedMedia = async (
  prisma: PrismaClient,
  productId1: string,
  variantId1: string
) => {
  // Deterministic search for existing seed media by storageKey
  const mediaKey1 = 'products/smartphone-x-black.png';
  let media1 = await prisma.media.findFirst({
    where: { storageKey: mediaKey1 },
  });

  if (!media1) {
    media1 = await prisma.media.create({
      data: {
        fileName: 'smartphone-x-black.png',
        storageKey: mediaKey1,
        url: 'https://placeholder.storage/products/smartphone-x-black.png',
        mimeType: 'image/png',
        fileSize: 1024500,
        mediaType: MediaType.IMAGE,
        altText: 'Black Smartphone X Front View',
      },
    });
  }

  // Product Media mapping
  await prisma.productMedia.upsert({
    where: {
      productId_mediaId: {
        productId: productId1,
        mediaId: media1.id,
      },
    },
    update: { isPrimary: true },
    create: {
      productId: productId1,
      mediaId: media1.id,
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // Variant Media mapping
  await prisma.variantMedia.upsert({
    where: {
      variantId_mediaId: {
        variantId: variantId1,
        mediaId: media1.id,
      },
    },
    update: { isPrimary: true },
    create: {
      variantId: variantId1,
      mediaId: media1.id,
      displayOrder: 1,
      isPrimary: true,
    },
  });

  console.log(`  ✓ Seeded Media metadata & Product/Variant Media mappings`);
};
