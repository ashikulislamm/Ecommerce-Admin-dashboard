import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import BrandService from '../../src/modules/brands/brand.service.js';
import BrandRepository from '../../src/modules/brands/brand.repository.js';

describe('Phase 12 — Brand Management Unit Tests', () => {
  it('should create a valid brand with auto slug', async () => {
    const time = Date.now();
    const brand = await BrandService.createBrand({
      name: `Test Brand ${time}`,
      description: 'Unit test brand',
    });

    assert.ok(brand.id);
    assert.equal(brand.slug, `test-brand-${time}`);

    // Clean up
    await BrandRepository.deleteBrand(brand.id);
  });

  it('should reject duplicate brand name with 409 Conflict', async () => {
    const time = Date.now();
    const brandName = `Dupe Brand ${time}`;
    const brand = await BrandService.createBrand({ name: brandName });

    try {
      await assert.rejects(
        async () => {
          await BrandService.createBrand({ name: brandName });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /already exists/i);
          return true;
        },
      );
    } finally {
      await BrandRepository.deleteBrand(brand.id);
    }
  });

  it('should prevent deleting brand with assigned products (409 Conflict)', async () => {
    // Find seeded brand (e.g. Apple or Nike) that has products
    const seeded = await BrandRepository.findByName('Apple');
    if (seeded && seeded._count.products > 0) {
      await assert.rejects(
        async () => {
          await BrandService.deleteBrand(seeded.id);
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /assigned product/i);
          return true;
        },
      );
    }
  });
});
