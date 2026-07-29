import prisma from '../../lib/prisma.js';
import type { BrandQuery, CreateBrandInput, UpdateBrandInput } from './brand.types.js';

export class BrandRepository {
  static async findById(id: string) {
    return prisma.brand.findUnique({
      where: { id },
      include: {
        logoMedia: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  static async findByName(name: string) {
    return prisma.brand.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.brand.findUnique({
      where: { slug },
    });
  }

  static async createBrand(data: CreateBrandInput & { slug: string }) {
    return prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        logoMediaId: data.logoMediaId ?? null,
        status: data.status,
      },
      include: {
        logoMedia: true,
      },
    });
  }

  static async updateBrand(id: string, data: UpdateBrandInput & { slug?: string }) {
    return prisma.brand.update({
      where: { id },
      data,
      include: {
        logoMedia: true,
      },
    });
  }

  static async deleteBrand(id: string) {
    return prisma.brand.delete({
      where: { id },
    });
  }

  static async countProducts(brandId: string): Promise<number> {
    return prisma.product.count({
      where: { brandId },
    });
  }

  static async findManyPaginated(params: BrandQuery) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          logoMedia: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}

export default BrandRepository;