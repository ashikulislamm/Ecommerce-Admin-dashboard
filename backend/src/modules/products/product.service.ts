import { ProductRepository } from './product.repository';
import type {
  CreateSimpleProductInput,
  CreateVariableProductInput,
  UpdateProductInput,
  ProductFilterQuery,
  GenerateVariantsMatrixInput,
} from './product.types';
import prisma from '../../lib/prisma.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ProductService {
  static async createSimpleProduct(input: CreateSimpleProductInput) {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    // 1. Check duplicate slug
    const existingSlug = await ProductRepository.findBySlug(slug);
    if (existingSlug) {
      const err: any = new Error(`Product slug "${slug}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    // 2. Check duplicate SKU
    const existingSku = await ProductRepository.findBySku(input.sku);
    if (existingSku) {
      const err: any = new Error(`SKU "${input.sku}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    // 3. Domain validation: negative price / stock
    if (input.price < 0) {
      const err: any = new Error('Price cannot be negative');
      err.statusCode = 400;
      throw err;
    }
    if (input.stockQuantity < 0) {
      const err: any = new Error('Stock quantity cannot be negative');
      err.statusCode = 400;
      throw err;
    }

    // 4. Domain validation: sale price > regular price
    if (input.compareAtPrice !== undefined && input.compareAtPrice !== null) {
      if (input.compareAtPrice < input.price) {
        const err: any = new Error('Sale price (compareAtPrice) must be greater than or equal to regular price');
        err.statusCode = 400;
        throw err;
      }
    }

    // 5. Verify Brand
    if (input.brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: input.brandId } });
      if (!brand || brand.deletedAt) {
        const err: any = new Error(`Brand with ID "${input.brandId}" not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    // 6. Verify Categories
    if (input.categoryIds && input.categoryIds.length > 0) {
      const foundCount = await prisma.category.count({
        where: { id: { in: input.categoryIds }, deletedAt: null },
      });
      if (foundCount !== input.categoryIds.length) {
        const err: any = new Error('One or more specified category IDs were not found');
        err.statusCode = 404;
        throw err;
      }
    }

    return ProductRepository.createSimple(input, slug);
  }

  static async createVariableProduct(input: CreateVariableProductInput) {
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    // 1. Check duplicate slug
    const existingSlug = await ProductRepository.findBySlug(slug);
    if (existingSlug) {
      const err: any = new Error(`Product slug "${slug}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    // 2. Check duplicate base SKU
    const existingBaseSku = await ProductRepository.findBySku(input.sku);
    if (existingBaseSku) {
      const err: any = new Error(`Product base SKU "${input.sku}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    // 3. Check duplicate variant SKUs within request & database
    const variantSkus = input.variants.map((v) => v.sku);
    if (new Set(variantSkus).size !== variantSkus.length) {
      const err: any = new Error('Duplicate SKUs found among variants');
      err.statusCode = 400;
      throw err;
    }

    for (const vSku of variantSkus) {
      if (vSku === input.sku) {
        const err: any = new Error(`Variant SKU "${vSku}" cannot be identical to product base SKU`);
        err.statusCode = 400;
        throw err;
      }
      const existing = await ProductRepository.findBySku(vSku);
      if (existing) {
        const err: any = new Error(`Variant SKU "${vSku}" already exists in system`);
        err.statusCode = 409;
        throw err;
      }
    }

    // 4. Validate duplicate attribute combinations
    const comboKeys = input.variants.map((v) => [...v.attributeValueIds].sort().join(':'));
    if (new Set(comboKeys).size !== comboKeys.length) {
      const err: any = new Error('Duplicate attribute value combinations found among variants');
      err.statusCode = 400;
      throw err;
    }

    // 5. Validate price / stock / sale price on all variants
    for (const v of input.variants) {
      if (v.price < 0) {
        const err: any = new Error(`Variant SKU "${v.sku}" has negative price`);
        err.statusCode = 400;
        throw err;
      }
      if (v.stockQuantity < 0) {
        const err: any = new Error(`Variant SKU "${v.sku}" has negative stock`);
        err.statusCode = 400;
        throw err;
      }
      if (v.compareAtPrice !== undefined && v.compareAtPrice !== null && v.compareAtPrice < v.price) {
        const err: any = new Error(`Variant SKU "${v.sku}" sale price must be greater than or equal to regular price`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 6. Verify Brand
    if (input.brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: input.brandId } });
      if (!brand || brand.deletedAt) {
        const err: any = new Error(`Brand with ID "${input.brandId}" not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    // 7. Verify Categories
    if (input.categoryIds && input.categoryIds.length > 0) {
      const foundCount = await prisma.category.count({
        where: { id: { in: input.categoryIds }, deletedAt: null },
      });
      if (foundCount !== input.categoryIds.length) {
        const err: any = new Error('One or more specified category IDs were not found');
        err.statusCode = 404;
        throw err;
      }
    }

    return ProductRepository.createVariable(input, slug);
  }

  static generateVariantMatrix(input: GenerateVariantsMatrixInput, baseSku: string = 'PROD') {
    const groups = input.attributeValueIdsGrouped;
    if (groups.length === 0) return [];

    // Cartesian product algorithm
    const cartesian = (args: string[][]): string[][] => {
      const r: string[][] = [];
      const max = args.length - 1;

      function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = [...arr, args[i][j]];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }

      helper([], 0);
      return r;
    };

    const combinations = cartesian(groups);

    return combinations.map((combo, idx) => ({
      attributeValueIds: combo,
      suggestedSku: `${baseSku.toUpperCase()}-VAR-${idx + 1}`,
    }));
  }

  static async getProducts(query: ProductFilterQuery) {
    return ProductRepository.findAll(query);
  }

  static async getProductById(id: string) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      const err: any = new Error(`Product with ID "${id}" not found`);
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  static async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      const err: any = new Error(`Product with ID "${id}" not found`);
      err.statusCode = 404;
      throw err;
    }

    let newSlug: string | undefined = undefined;
    if (input.slug || input.name) {
      newSlug = slugify(input.slug || input.name || '');
      const existingSlug = await ProductRepository.findBySlug(newSlug, id);
      if (existingSlug) {
        const err: any = new Error(`Product slug "${newSlug}" already exists`);
        err.statusCode = 409;
        throw err;
      }
    }

    if (input.sku && input.sku !== existing.sku) {
      const existingSku = await ProductRepository.findBySku(input.sku, id);
      if (existingSku) {
        const err: any = new Error(`SKU "${input.sku}" already exists`);
        err.statusCode = 409;
        throw err;
      }
    }

    if (input.price !== undefined && input.price < 0) {
      const err: any = new Error('Price cannot be negative');
      err.statusCode = 400;
      throw err;
    }

    if (input.stockQuantity !== undefined && input.stockQuantity < 0) {
      const err: any = new Error('Stock quantity cannot be negative');
      err.statusCode = 400;
      throw err;
    }

    return ProductRepository.update(id, input, newSlug);
  }

  static async deleteProduct(id: string) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      const err: any = new Error(`Product with ID "${id}" not found`);
      err.statusCode = 404;
      throw err;
    }
    return ProductRepository.softDelete(id);
  }
}