import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import CategoryService from '../../src/modules/categories/category.service.js';
import CategoryRepository from '../../src/modules/categories/category.repository.js';

describe('Phase 11 — Category Management Unit Tests', () => {
  it('should build recursive category tree', async () => {
    const tree = await CategoryService.getCategoryTree();
    assert.ok(Array.isArray(tree));
    assert.ok(tree.length > 0, 'Category tree should contain root nodes');
  });

  it('should create root category and subcategory', async () => {
    const time = Date.now();
    const parent = await CategoryService.createCategory({
      name: `Parent Cat ${time}`,
      description: 'Root category for unit test',
    });

    const child = await CategoryService.createCategory({
      name: `Child Cat ${time}`,
      parentId: parent.id,
    });

    assert.ok(parent.id);
    assert.ok(child.id);
    assert.equal(child.parentId, parent.id);

    // Clean up
    await CategoryRepository.deleteCategory(child.id);
    await CategoryRepository.deleteCategory(parent.id);
  });

  it('should reject self-parenting with 400 Bad Request', async () => {
    const time = Date.now();
    const cat = await CategoryService.createCategory({
      name: `Self Parent Cat ${time}`,
    });

    try {
      await assert.rejects(
        async () => {
          await CategoryService.updateCategory(cat.id, {
            parentId: cat.id,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /own parent/i);
          return true;
        },
      );
    } finally {
      await CategoryRepository.deleteCategory(cat.id);
    }
  });

  it('should reject indirect circular hierarchy loops (A -> B -> C -> A) with 400 Bad Request', async () => {
    const time = Date.now();
    // Create chain: Cat A -> Cat B -> Cat C
    const catA = await CategoryService.createCategory({ name: `Cat A ${time}` });
    const catB = await CategoryService.createCategory({ name: `Cat B ${time}`, parentId: catA.id });
    const catC = await CategoryService.createCategory({ name: `Cat C ${time}`, parentId: catB.id });

    try {
      // Attempt to set Cat A's parent to Cat C (would create cycle: C -> B -> A -> C)
      await assert.rejects(
        async () => {
          await CategoryService.updateCategory(catA.id, {
            parentId: catC.id,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /circular hierarchy loop/i);
          return true;
        },
      );
    } finally {
      await CategoryRepository.deleteCategory(catC.id);
      await CategoryRepository.deleteCategory(catB.id);
      await CategoryRepository.deleteCategory(catA.id);
    }
  });

  it('should prevent deleting category with subcategories (409 Conflict)', async () => {
    const time = Date.now();
    const parent = await CategoryService.createCategory({ name: `Parent ${time}` });
    const child = await CategoryService.createCategory({ name: `Child ${time}`, parentId: parent.id });

    try {
      await assert.rejects(
        async () => {
          await CategoryService.deleteCategory(parent.id);
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /subcategory/i);
          return true;
        },
      );
    } finally {
      await CategoryRepository.deleteCategory(child.id);
      await CategoryRepository.deleteCategory(parent.id);
    }
  });
});
