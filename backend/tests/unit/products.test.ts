import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProductService } from '../../src/modules/products/product.service.js';
import CategoryService from '../../src/modules/categories/category.service.js';
import BrandService from '../../src/modules/brands/brand.service.js';
import AttributeService from '../../src/modules/attributes/attribute.service.js';
import prisma from '../../src/lib/prisma.js';
import { AttributeType } from '../../src/generated/prisma/index.js';

describe('Phase 15 & 16 — Simple & Variable Product Unit Tests', () => {
  it('should create a valid simple product and reject negative price or invalid sale price', async () => {
    const time = Date.now();

    // 1. Setup Category & Brand
    const cat = await CategoryService.createCategory({ name: `Test Cat ${time}` });
    const brand = await BrandService.createBrand({ name: `Test Brand ${time}` });

    // 2. Create simple product
    const product = await ProductService.createSimpleProduct({
      name: `Simple Laptop ${time}`,
      sku: `SKU-SMP-${time}`,
      price: 999.99,
      compareAtPrice: 1200.00,
      stockQuantity: 15,
      categoryIds: [cat.id],
      brandId: brand.id,
      status: 'ACTIVE',
    });

    assert.ok(product?.id);
    assert.equal(product.name, `Simple Laptop ${time}`);
    assert.equal(product.productType, 'SIMPLE');
    assert.equal(product.variants.length, 1);
    assert.equal(Number(product.variants[0].price), 999.99);

    // 3. Reject negative price
    await assert.rejects(
      async () => {
        await ProductService.createSimpleProduct({
          name: `Negative Price ${time}`,
          sku: `SKU-NEG-${time}`,
          price: -50,
          stockQuantity: 10,
          categoryIds: [cat.id],
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /negative/i);
        return true;
      },
    );

    // 4. Reject sale price < regular price
    await assert.rejects(
      async () => {
        await ProductService.createSimpleProduct({
          name: `Bad Sale Price ${time}`,
          sku: `SKU-SALE-${time}`,
          price: 100,
          compareAtPrice: 50,
          stockQuantity: 10,
          categoryIds: [cat.id],
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /sale price/i);
        return true;
      },
    );

    // Clean up
    await prisma.product.delete({ where: { id: product.id } });
    await BrandService.deleteBrand(brand.id);
    await CategoryService.deleteCategory(cat.id);
  });

  it('should generate variant matrix and create a variable product with variants', async () => {
    const time = Date.now();

    // 1. Setup Category, Brand, Attributes (Color & Size)
    const cat = await CategoryService.createCategory({ name: `Apparel ${time}` });
    const attrColor = await AttributeService.createAttribute({ name: `Color ${time}`, type: AttributeType.COLOR_SWATCH });
    const attrSize = await AttributeService.createAttribute({ name: `Size ${time}`, type: AttributeType.DROPDOWN });

    const valRed = await AttributeService.createAttributeValue(attrColor.id, { value: 'Red', displayColor: '#FF0000' });
    const valBlue = await AttributeService.createAttributeValue(attrColor.id, { value: 'Blue', displayColor: '#0000FF' });

    const valS = await AttributeService.createAttributeValue(attrSize.id, { value: 'S' });
    const valM = await AttributeService.createAttributeValue(attrSize.id, { value: 'M' });

    // 2. Generate variant matrix (Cartesian: 2 colors x 2 sizes = 4 combinations)
    const matrix = ProductService.generateVariantMatrix(
      {
        attributeValueIdsGrouped: [
          [valRed.id, valBlue.id],
          [valS.id, valM.id],
        ],
      },
      `SHIRT-${time}`,
    );

    assert.equal(matrix.length, 4);
    assert.equal(matrix[0].suggestedSku, `SHIRT-${time}-VAR-1`);

    // 3. Create Variable Product with 4 variants
    const varProduct = await ProductService.createVariableProduct({
      name: `Cotton T-Shirt ${time}`,
      sku: `SHIRT-${time}`,
      categoryIds: [cat.id],
      status: 'ACTIVE',
      variants: matrix.map((item, i) => ({
        sku: item.suggestedSku,
        price: 25.0 + i,
        stockQuantity: 10 + i,
        attributeValueIds: item.attributeValueIds,
      })),
    });

    assert.ok(varProduct?.id);
    assert.equal(varProduct.productType, 'VARIABLE');
    assert.equal(varProduct.variants.length, 4);

    // 4. Test duplicate attribute combination rejection
    await assert.rejects(
      async () => {
        await ProductService.createVariableProduct({
          name: `Dup Combo T-Shirt ${time}`,
          sku: `SHIRT-DUP-${time}`,
          categoryIds: [cat.id],
          variants: [
            {
              sku: `SHIRT-DUP-${time}-1`,
              price: 25,
              stockQuantity: 10,
              attributeValueIds: [valRed.id, valS.id],
            },
            {
              sku: `SHIRT-DUP-${time}-2`,
              price: 25,
              stockQuantity: 10,
              attributeValueIds: [valRed.id, valS.id], // duplicate combination!
            },
          ],
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /duplicate attribute/i);
        return true;
      },
    );

    // Clean up
    await prisma.product.delete({ where: { id: varProduct.id } });
    await AttributeService.deleteAttributeValue(valRed.id);
    await AttributeService.deleteAttributeValue(valBlue.id);
    await AttributeService.deleteAttributeValue(valS.id);
    await AttributeService.deleteAttributeValue(valM.id);
    await AttributeService.deleteAttribute(attrColor.id);
    await AttributeService.deleteAttribute(attrSize.id);
    await CategoryService.deleteCategory(cat.id);
  });
});
