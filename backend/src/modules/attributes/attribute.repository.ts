import prisma from '../../lib/prisma.js';
import type {
  AttributeQuery,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateAttributeValueInput,
  UpdateAttributeValueInput,
} from './attribute.types.js';

export class AttributeRepository {
  static async findById(id: string) {
    return prisma.attribute.findUnique({
      where: { id },
      include: {
        values: {
          include: {
            imageMedia: true,
            _count: {
              select: {
                variantAttributeValues: true,
              },
            },
          },
          orderBy: { value: 'asc' },
        },
      },
    });
  }

  static async findByName(name: string) {
    return prisma.attribute.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
      include: {
        values: {
          include: {
            imageMedia: true,
            _count: {
              select: {
                variantAttributeValues: true,
              },
            },
          },
          orderBy: { value: 'asc' },
        },
      },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.attribute.findUnique({
      where: { slug },
    });
  }

  static async createAttribute(data: CreateAttributeInput & { slug: string }) {
    return prisma.attribute.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description ?? null,
      },
      include: {
        values: true,
      },
    });
  }

  static async updateAttribute(id: string, data: UpdateAttributeInput & { slug?: string }) {
    return prisma.attribute.update({
      where: { id },
      data,
      include: {
        values: true,
      },
    });
  }

  static async deleteAttribute(id: string) {
    return prisma.attribute.delete({
      where: { id },
    });
  }

  // --- Attribute Values ---

  static async findValueById(id: string) {
    return prisma.attributeValue.findUnique({
      where: { id },
      include: {
        attribute: true,
        imageMedia: true,
        _count: {
          select: {
            variantAttributeValues: true,
          },
        },
      },
    });
  }

  static async findValueByAttributeAndValue(attributeId: string, value: string) {
    return prisma.attributeValue.findUnique({
      where: {
        attributeId_value: {
          attributeId,
          value,
        },
      },
    });
  }

  static async createAttributeValue(data: CreateAttributeValueInput) {
    return prisma.attributeValue.create({
      data: {
        attributeId: data.attributeId,
        value: data.value,
        displayColor: data.displayColor ?? null,
        imageMediaId: data.imageMediaId ?? null,
      },
      include: {
        imageMedia: true,
      },
    });
  }

  static async updateAttributeValue(id: string, data: UpdateAttributeValueInput) {
    return prisma.attributeValue.update({
      where: { id },
      data,
      include: {
        imageMedia: true,
      },
    });
  }

  static async deleteAttributeValue(id: string) {
    return prisma.attributeValue.delete({
      where: { id },
    });
  }

  static async countAttributeVariantUsage(attributeId: string): Promise<number> {
    return prisma.variantAttributeValue.count({
      where: {
        attributeValue: {
          attributeId,
        },
        variant: {
          deletedAt: null,
        },
      },
    });
  }

  static async countValueVariantUsage(valueId: string): Promise<number> {
    return prisma.variantAttributeValue.count({
      where: {
        attributeValueId: valueId,
        variant: {
          deletedAt: null,
        },
      },
    });
  }

  static async findManyPaginated(params: AttributeQuery) {
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

    if (params.type) {
      where.type = params.type;
    }

    const [items, total] = await Promise.all([
      prisma.attribute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          values: {
            include: {
              imageMedia: true,
              _count: {
                select: {
                  variantAttributeValues: true,
                },
              },
            },
            orderBy: { value: 'asc' },
          },
        },
      }),
      prisma.attribute.count({ where }),
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

export default AttributeRepository;