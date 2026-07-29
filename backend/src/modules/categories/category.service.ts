import { AppError } from '../../shared/errors/app-error.js';
import CategoryRepository from './category.repository.js';
import type {
  CategoryQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryTreeNode,
} from './category.types.js';

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

export class CategoryService {
  /**
   * Builds a recursive category tree
   */
  static async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const allCategories = await CategoryRepository.findAllForTree();

    const categoryMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Initialize map
    for (const cat of allCategories) {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      });
    }

    // Connect hierarchy
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parentNode = categoryMap.get(cat.parentId)!;
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Prevents circular hierarchy loops (e.g. A -> B -> C -> A or C -> A when A is parent of C)
   */
  private static async validateNoCycle(targetCategoryId: string, proposedParentId: string): Promise<void> {
    if (targetCategoryId === proposedParentId) {
      throw AppError.badRequest('A category cannot be its own parent.');
    }

    let currentParentId: string | null = proposedParentId;
    const visited = new Set<string>([targetCategoryId]);

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw AppError.badRequest(
          'Invalid parent category: would create a circular hierarchy loop.',
        );
      }
      visited.add(currentParentId);

      const parentCategory = await CategoryRepository.findById(currentParentId);
      if (!parentCategory) break;
      currentParentId = parentCategory.parentId;
    }
  }

  /**
   * Create category
   */
  static async createCategory(input: CreateCategoryInput) {
    const name = input.name.trim();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

    // Check duplicate slug
    const existingSlug = await CategoryRepository.findBySlug(slug);
    if (existingSlug) {
      throw AppError.conflict(`Category with slug "${slug}" already exists.`);
    }

    // Validate parent exists and is not cyclic
    if (input.parentId) {
      const parent = await CategoryRepository.findById(input.parentId);
      if (!parent) {
        throw AppError.badRequest(`Parent category with ID "${input.parentId}" not found.`);
      }
    }

    return CategoryRepository.createCategory({
      ...input,
      name,
      slug,
    });
  }

  /**
   * List paginated categories
   */
  static async getCategories(query: CategoryQuery) {
    return CategoryRepository.findManyPaginated(query);
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound(`Category with ID "${id}" not found.`);
    }
    return category;
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, input: UpdateCategoryInput) {
    const existing = await this.getCategoryById(id);

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = slugify(input.slug);
      const duplicateSlug = await CategoryRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw AppError.conflict(`Category with slug "${slug}" already exists.`);
      }
    } else if (input.name && input.name !== existing.name && !input.slug) {
      slug = slugify(input.name);
      const duplicateSlug = await CategoryRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Cycle prevention check
    if (input.parentId !== undefined && input.parentId !== null) {
      const parent = await CategoryRepository.findById(input.parentId);
      if (!parent) {
        throw AppError.badRequest(`Parent category with ID "${input.parentId}" not found.`);
      }
      await this.validateNoCycle(id, input.parentId);
    }

    return CategoryRepository.updateCategory(id, {
      ...input,
      slug,
    });
  }

  /**
   * Delete category safely
   */
  static async deleteCategory(id: string) {
    await this.getCategoryById(id);

    // Rule: Has children -> Reject
    const childrenCount = await CategoryRepository.countChildren(id);
    if (childrenCount > 0) {
      throw AppError.conflict(
        `Cannot delete category because it has ${childrenCount} subcategory(ies).`,
      );
    }

    // Rule: Has products -> Reject
    const productCount = await CategoryRepository.countProducts(id);
    if (productCount > 0) {
      throw AppError.conflict(
        `Cannot delete category because it has ${productCount} assigned product(s).`,
      );
    }

    return CategoryRepository.deleteCategory(id);
  }
}

export default CategoryService;