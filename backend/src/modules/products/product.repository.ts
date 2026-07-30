import prisma from '../../lib/prisma.js';
import type { Prisma } from '@prisma/client';
import type {
  CreateSimpleProductInput,
  CreateVariableProductInput,
  UpdateProductInput,
  ProductFilterQuery,
} from './product.types';

export class ProductRepository {
  /**
   * Helper to include full relations
   */
  private static includeFull() {
    return {
      brand: {
        select: { id: true, name: true, slug: true, status: true },
      },
      productCategories: {
        include: {
          category: {
            select: { id: true, name: true, slug: true, status: true },
          },
        },
      },
      productMedia: {
        include: {
          media: true,
        },
        orderBy: { displayOrder: 'asc' as const },
      },
      variants: {
        where: { deletedAt: null },
        include: {
          variantAttributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: {
                    select: { id: true, name: true, slug: true, type: true },
                  },
                },
              },
            },
          },
          variantMedia: {
            include: {
              media: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
        },
      },
    };
  }

  static async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: this.includeFull(),
    });
  }

  static async findBySlug(slug: string, excludeId?: string) {
    return prisma.product.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  static async findBySku(sku: string, excludeProductId?: string) {
    // Check product base SKU
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        deletedAt: null,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
    });
    if (existingProduct) return existingProduct;

    // Check variant SKU
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        deletedAt: null,
        ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
      },
    });
    return existingVariant ? existingVariant : null;
  }

  static async createSimple(input: CreateSimpleProductInput, slug: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug,
          sku: input.sku,
          description: input.description,
          brandId: input.brandId || null,
          productType: 'SIMPLE',
          status: input.status || 'DRAFT',
        },
      });

      // 2. Create single default Variant
      await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: input.sku,
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          costPrice: input.costPrice ?? null,
          stockQuantity: input.stockQuantity,
          lowStockThreshold: input.lowStockThreshold ?? 5,
          weight: input.weight ?? null,
          status: 'ACTIVE',
        },
      });

      // 3. Attach Categories
      if (input.categoryIds && input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((catId) => ({
            productId: product.id,
            categoryId: catId,
          })),
        });
      }

      // 4. Attach Media (Thumbnail + Gallery)
      const mediaJunctions: Prisma.ProductMediaCreateManyInput[] = [];
      let order = 0;

      if (input.thumbnailMediaId) {
        mediaJunctions.push({
          productId: product.id,
          mediaId: input.thumbnailMediaId,
          isPrimary: true,
          displayOrder: order++,
        });
      }

      if (input.galleryMediaIds && input.galleryMediaIds.length > 0) {
        for (const gId of input.galleryMediaIds) {
          if (gId !== input.thumbnailMediaId) {
            mediaJunctions.push({
              productId: product.id,
              mediaId: gId,
              isPrimary: false,
              displayOrder: order++,
            });
          }
        }
      }

      if (mediaJunctions.length > 0) {
        await tx.productMedia.createMany({
          data: mediaJunctions,
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: ProductRepository.includeFull(),
      });
    });
  }

  static async createVariable(input: CreateVariableProductInput, slug: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug,
          sku: input.sku,
          description: input.description,
          brandId: input.brandId || null,
          productType: 'VARIABLE',
          status: input.status || 'DRAFT',
        },
      });

      // 2. Attach Categories
      if (input.categoryIds && input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((catId) => ({
            productId: product.id,
            categoryId: catId,
          })),
        });
      }

      // 3. Attach Base Product Media
      const mediaJunctions: Prisma.ProductMediaCreateManyInput[] = [];
      let order = 0;

      if (input.thumbnailMediaId) {
        mediaJunctions.push({
          productId: product.id,
          mediaId: input.thumbnailMediaId,
          isPrimary: true,
          displayOrder: order++,
        });
      }

      if (input.galleryMediaIds && input.galleryMediaIds.length > 0) {
        for (const gId of input.galleryMediaIds) {
          if (gId !== input.thumbnailMediaId) {
            mediaJunctions.push({
              productId: product.id,
              mediaId: gId,
              isPrimary: false,
              displayOrder: order++,
            });
          }
        }
      }

      if (mediaJunctions.length > 0) {
        await tx.productMedia.createMany({ data: mediaJunctions });
      }

      // 4. Create Variants & Attribute Junctions
      for (const vInput of input.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: vInput.sku,
            price: vInput.price,
            compareAtPrice: vInput.compareAtPrice ?? null,
            costPrice: vInput.costPrice ?? null,
            stockQuantity: vInput.stockQuantity,
            lowStockThreshold: vInput.lowStockThreshold ?? 5,
            weight: vInput.weight ?? null,
            status: vInput.status || 'ACTIVE',
          },
        });

        // Variant Attributes
        if (vInput.attributeValueIds && vInput.attributeValueIds.length > 0) {
          await tx.variantAttributeValue.createMany({
            data: vInput.attributeValueIds.map((attrValId) => ({
              variantId: variant.id,
              attributeValueId: attrValId,
            })),
          });
        }

        // Variant Media
        const vMedia: Prisma.VariantMediaCreateManyInput[] = [];
        let vOrder = 0;
        if (vInput.primaryMediaId) {
          vMedia.push({
            variantId: variant.id,
            mediaId: vInput.primaryMediaId,
            isPrimary: true,
            displayOrder: vOrder++,
          });
        }
        if (vInput.mediaIds && vInput.mediaIds.length > 0) {
          for (const mId of vInput.mediaIds) {
            if (mId !== vInput.primaryMediaId) {
              vMedia.push({
                variantId: variant.id,
                mediaId: mId,
                isPrimary: false,
                displayOrder: vOrder++,
              });
            }
          }
        }
        if (vMedia.length > 0) {
          await tx.variantMedia.createMany({ data: vMedia });
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: ProductRepository.includeFull(),
      });
    });
  }

  static async update(id: string, input: UpdateProductInput, newSlug?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Update basic product fields
      await tx.product.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(newSlug ? { slug: newSlug } : {}),
          ...(input.sku ? { sku: input.sku } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
      });

      // 2. Update Categories if provided
      if (input.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (input.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: input.categoryIds.map((catId) => ({
              productId: id,
              categoryId: catId,
            })),
          });
        }
      }

      // 3. Update Product Media if provided
      if (input.thumbnailMediaId !== undefined || input.galleryMediaIds !== undefined) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        const mediaJunctions: Prisma.ProductMediaCreateManyInput[] = [];
        let order = 0;

        if (input.thumbnailMediaId) {
          mediaJunctions.push({
            productId: id,
            mediaId: input.thumbnailMediaId,
            isPrimary: true,
            displayOrder: order++,
          });
        }

        if (input.galleryMediaIds && input.galleryMediaIds.length > 0) {
          for (const gId of input.galleryMediaIds) {
            if (gId !== input.thumbnailMediaId) {
              mediaJunctions.push({
                productId: id,
                mediaId: gId,
                isPrimary: false,
                displayOrder: order++,
              });
            }
          }
        }

        if (mediaJunctions.length > 0) {
          await tx.productMedia.createMany({ data: mediaJunctions });
        }
      }

      // 4. Update simple product default variant price/stock if simple
      const existingProduct = await tx.product.findUnique({ where: { id } });
      if (existingProduct?.productType === 'SIMPLE') {
        const defaultVariant = await tx.productVariant.findFirst({
          where: { productId: id, deletedAt: null },
        });

        if (defaultVariant) {
          await tx.productVariant.update({
            where: { id: defaultVariant.id },
            data: {
              ...(input.sku ? { sku: input.sku } : {}),
              ...(input.price !== undefined ? { price: input.price } : {}),
              ...(input.compareAtPrice !== undefined ? { compareAtPrice: input.compareAtPrice } : {}),
              ...(input.costPrice !== undefined ? { costPrice: input.costPrice } : {}),
              ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
              ...(input.lowStockThreshold !== undefined ? { lowStockThreshold: input.lowStockThreshold } : {}),
              ...(input.weight !== undefined ? { weight: input.weight } : {}),
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: ProductRepository.includeFull(),
      });
    });
  }

  static async findAll(query: ProductFilterQuery) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.max(query.limit || 10, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.productType ? { productType: query.productType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.categoryId
        ? {
            productCategories: {
              some: { categoryId: query.categoryId },
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Price range filter at variant level
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.variants = {
        some: {
          deletedAt: null,
          ...(query.minPrice !== undefined ? { price: { gte: query.minPrice } } : {}),
          ...(query.maxPrice !== undefined ? { price: { lte: query.maxPrice } } : {}),
        },
      };
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: ProductRepository.includeFull(),
      }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async softDelete(id: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { deletedAt: now },
      });
      return tx.product.update({
        where: { id },
        data: { deletedAt: now },
      });
    });
  }
}