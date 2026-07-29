import { AppError } from '../../shared/errors/app-error.js';
import AttributeRepository from './attribute.repository.js';
import type {
  AttributeQuery,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateAttributeValueInput,
  UpdateAttributeValueInput,
} from './attribute.types.js';

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

export class AttributeService {
  /**
   * Create attribute
   */
  static async createAttribute(input: CreateAttributeInput) {
    const name = input.name.trim();
    const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

    // Duplicate name check -> 409 Conflict
    const existingName = await AttributeRepository.findByName(name);
    if (existingName) {
      throw AppError.conflict(`Attribute with name "${name}" already exists.`);
    }

    // Duplicate slug check -> 409 Conflict
    const existingSlug = await AttributeRepository.findBySlug(slug);
    if (existingSlug) {
      throw AppError.conflict(`Attribute with slug "${slug}" already exists.`);
    }

    return AttributeRepository.createAttribute({
      ...input,
      name,
      slug,
    });
  }

  /**
   * List attributes
   */
  static async getAttributes(query: AttributeQuery) {
    return AttributeRepository.findManyPaginated(query);
  }

  /**
   * Get attribute by ID
   */
  static async getAttributeById(id: string) {
    const attribute = await AttributeRepository.findById(id);
    if (!attribute) {
      throw AppError.notFound(`Attribute with ID "${id}" not found.`);
    }
    return attribute;
  }

  /**
   * Update attribute
   */
  static async updateAttribute(id: string, input: UpdateAttributeInput) {
    const existing = await this.getAttributeById(id);

    if (input.name && input.name.trim() !== existing.name) {
      const duplicateName = await AttributeRepository.findByName(input.name.trim());
      if (duplicateName && duplicateName.id !== id) {
        throw AppError.conflict(`Attribute with name "${input.name}" already exists.`);
      }
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = slugify(input.slug);
      const duplicateSlug = await AttributeRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw AppError.conflict(`Attribute with slug "${slug}" already exists.`);
      }
    } else if (input.name && input.name.trim() !== existing.name && !input.slug) {
      slug = slugify(input.name);
      const duplicateSlug = await AttributeRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    return AttributeRepository.updateAttribute(id, {
      ...input,
      name: input.name?.trim(),
      slug,
    });
  }

  /**
   * Delete attribute safely
   */
  static async deleteAttribute(id: string) {
    await this.getAttributeById(id);

    // Rule: Reject if attribute values are used by product variants
    const variantUsageCount = await AttributeRepository.countAttributeVariantUsage(id);
    if (variantUsageCount > 0) {
      throw AppError.conflict(
        `Cannot delete attribute because its values are used by ${variantUsageCount} product variant(s).`,
      );
    }

    return AttributeRepository.deleteAttribute(id);
  }

  // --- Attribute Values ---

  /**
   * Create attribute value
   */
  static async createAttributeValue(attributeId: string, input: Omit<CreateAttributeValueInput, 'attributeId'>) {
    await this.getAttributeById(attributeId);

    const valueStr = input.value.trim();

    // Check duplicate value under same attribute
    const existingValue = await AttributeRepository.findValueByAttributeAndValue(attributeId, valueStr);
    if (existingValue) {
      throw AppError.conflict(`Attribute value "${valueStr}" already exists for this attribute.`);
    }

    return AttributeRepository.createAttributeValue({
      ...input,
      attributeId,
      value: valueStr,
    });
  }

  /**
   * Update attribute value
   */
  static async updateAttributeValue(valueId: string, input: UpdateAttributeValueInput) {
    const existing = await AttributeRepository.findValueById(valueId);
    if (!existing) {
      throw AppError.notFound(`Attribute value with ID "${valueId}" not found.`);
    }

    if (input.value && input.value.trim() !== existing.value) {
      const valueStr = input.value.trim();
      const duplicateValue = await AttributeRepository.findValueByAttributeAndValue(
        existing.attributeId,
        valueStr,
      );
      if (duplicateValue && duplicateValue.id !== valueId) {
        throw AppError.conflict(`Attribute value "${valueStr}" already exists for this attribute.`);
      }
    }

    return AttributeRepository.updateAttributeValue(valueId, {
      ...input,
      value: input.value?.trim(),
    });
  }

  /**
   * Delete attribute value safely
   */
  static async deleteAttributeValue(valueId: string) {
    const existing = await AttributeRepository.findValueById(valueId);
    if (!existing) {
      throw AppError.notFound(`Attribute value with ID "${valueId}" not found.`);
    }

    // Rule: Reject if value is used by product variants
    const variantUsageCount = await AttributeRepository.countValueVariantUsage(valueId);
    if (variantUsageCount > 0) {
      throw AppError.conflict(
        `Cannot delete attribute value because it is used by ${variantUsageCount} product variant(s).`,
      );
    }

    return AttributeRepository.deleteAttributeValue(valueId);
  }
}

export default AttributeService;