import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import AttributeService from '../../src/modules/attributes/attribute.service.js';
import AttributeRepository from '../../src/modules/attributes/attribute.repository.js';
import prisma from '../../src/lib/prisma.js';
import { AttributeType } from '../../src/generated/prisma/index.js';

describe('Phase 13 — Attribute Management Unit Tests', () => {
  it('should create an attribute and attribute value with hex color', async () => {
    const time = Date.now();
    const attr = await AttributeService.createAttribute({
      name: `Color Test ${time}`,
      type: AttributeType.COLOR_SWATCH,
    });

    const val = await AttributeService.createAttributeValue(attr.id, {
      value: `Crimson ${time}`,
      displayColor: '#DC143C',
    });

    assert.ok(attr.id);
    assert.ok(val.id);
    assert.equal(val.displayColor, '#DC143C');

    // Clean up
    await AttributeRepository.deleteAttributeValue(val.id);
    await AttributeRepository.deleteAttribute(attr.id);
  });

  it('should reject duplicate attribute value under same attribute with 409 Conflict', async () => {
    const time = Date.now();
    const attr = await AttributeService.createAttribute({ name: `Size ${time}` });
    const val = await AttributeService.createAttributeValue(attr.id, { value: 'Large' });

    try {
      await assert.rejects(
        async () => {
          await AttributeService.createAttributeValue(attr.id, { value: 'Large' });
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /already exists/i);
          return true;
        },
      );
    } finally {
      await AttributeRepository.deleteAttributeValue(val.id);
      await AttributeRepository.deleteAttribute(attr.id);
    }
  });

  it('should prevent deleting attribute value used by product variants (409 Conflict)', async () => {
    const assignedVariantValue = await prisma.variantAttributeValue.findFirst();
    if (assignedVariantValue) {
      await assert.rejects(
        async () => {
          await AttributeService.deleteAttributeValue(assignedVariantValue.attributeValueId);
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /used by/i);
          return true;
        },
      );
    }
  });
});
