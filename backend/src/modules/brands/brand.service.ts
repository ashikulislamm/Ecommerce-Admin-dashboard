import { AppError } from '../../shared/errors/app-error.js';
import BrandRepository from './brand.repository.js';
import type { BrandQuery, CreateBrandInput, UpdateBrandInput } from './brand.types.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export class BrandService {
  /**
   * Create brand
   */
  static async createBrand(input: CreateBrandInput) {
    const name = input.name.trim();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

    // Rule: Duplicate name check -> 409 Conflict
    const existingName = await BrandRepository.findByName(name);
    if (existingName) {
      throw AppError.conflict(`Brand with name "${name}" already exists.`);
    }

    // Rule: Duplicate slug check -> 409 Conflict
    const existingSlug = await BrandRepository.findBySlug(slug);
    if (existingSlug) {
      throw AppError.conflict(`Brand with slug "${slug}" already exists.`);
    }

    return BrandRepository.createBrand({
      ...input,
      name,
      slug,
    });
  }

  /**
   * List paginated brands
   */
  static async getBrands(query: BrandQuery) {
    return BrandRepository.findManyPaginated(query);
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(id: string) {
    const brand = await BrandRepository.findById(id);
    if (!brand) {
      throw AppError.notFound(`Brand with ID "${id}" not found.`);
    }
    return brand;
  }

  /**
   * Update brand
   */
  static async updateBrand(id: string, input: UpdateBrandInput) {
    const existing = await this.getBrandById(id);

    if (input.name && input.name.trim() !== existing.name) {
      const duplicateName = await BrandRepository.findByName(input.name.trim());
      if (duplicateName && duplicateName.id !== id) {
        throw AppError.conflict(`Brand with name "${input.name}" already exists.`);
      }
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = slugify(input.slug);
      const duplicateSlug = await BrandRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw AppError.conflict(`Brand with slug "${slug}" already exists.`);
      }
    } else if (input.name && input.name.trim() !== existing.name && !input.slug) {
      slug = slugify(input.name);
      const duplicateSlug = await BrandRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    return BrandRepository.updateBrand(id, {
      ...input,
      name: input.name?.trim(),
      slug,
    });
  }

  /**
   * Delete brand safely
   */
  static async deleteBrand(id: string) {
    await this.getBrandById(id);

    // Rule: Brand has products -> Reject (409 Conflict)
    const productCount = await BrandRepository.countProducts(id);
    if (productCount > 0) {
      throw AppError.conflict(
        `Cannot delete brand because it has ${productCount} assigned product(s).`,
      );
    }

    return BrandRepository.deleteBrand(id);
  }
}

export default BrandService;