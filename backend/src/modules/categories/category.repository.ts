import prisma from '../../lib/prisma.js';
import type { CategoryQuery, CreateCategoryInput, UpdateCategoryInput } from './category.types.js';

export class CategoryRepository {
  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        imageMedia: true,
        _count: {
          select: {
            children: true,
            productCategories: true,
          },
        },
      },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  static async findByName(name: string) {
    return prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  static async createCategory(data: CreateCategoryInput & { slug: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        imageMediaId: data.imageMediaId ?? null,
        status: data.status,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        parent: true,
        imageMedia: true,
      },
    });
  }

  static async updateCategory(id: string, data: UpdateCategoryInput & { slug?: string }) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        imageMedia: true,
      },
    });
  }

  static async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  static async countChildren(parentId: string): Promise<number> {
    return prisma.category.count({
      where: { parentId },
    });
  }

  static async countProducts(categoryId: string): Promise<number> {
    return prisma.productCategory.count({
      where: { categoryId },
    });
  }

  static async findAllForTree() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        imageMedia: true,
      },
    });
  }

  static async findManyPaginated(params: CategoryQuery) {
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

    if (params.parentId !== undefined) {
      where.parentId = params.parentId === 'null' || params.parentId === 'root' ? null : params.parentId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          parent: true,
          imageMedia: true,
          _count: {
            select: {
              children: true,
              productCategories: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
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

export default CategoryRepository;