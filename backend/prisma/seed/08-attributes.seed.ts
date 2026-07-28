import { PrismaClient } from '../../src/generated/prisma/index.js';

interface AttributeValueInput {
  value: string;
  displayColor?: string;
}

interface AttributeInput {
  name: string;
  slug: string;
  description: string;
  values: AttributeValueInput[];
}

export const seedAttributes = async (prisma: PrismaClient) => {
  const attributeDefinitions: AttributeInput[] = [
    {
      name: 'Color',
      slug: 'color',
      description: 'Product color options',
      values: [
        { value: 'Black', displayColor: '#000000' },
        { value: 'White', displayColor: '#FFFFFF' },
        { value: 'Blue', displayColor: '#0000FF' },
      ],
    },
    {
      name: 'Size',
      slug: 'size',
      description: 'Clothing / equipment size options',
      values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }, { value: 'XL' }],
    },
    {
      name: 'Storage',
      slug: 'storage',
      description: 'Internal storage capacity',
      values: [{ value: '128GB' }, { value: '256GB' }, { value: '512GB' }],
    },
    {
      name: 'RAM',
      slug: 'ram',
      description: 'Memory capacity',
      values: [{ value: '8GB' }, { value: '16GB' }, { value: '32GB' }],
    },
  ];

  const attributeValueMap = new Map<string, string>(); // Key: "slug:value" -> id

  for (const attrDef of attributeDefinitions) {
    const attribute = await prisma.attribute.upsert({
      where: { slug: attrDef.slug },
      update: { name: attrDef.name, description: attrDef.description },
      create: { name: attrDef.name, slug: attrDef.slug, description: attrDef.description },
    });

    for (const val of attrDef.values) {
      const valueRecord = await prisma.attributeValue.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: val.value,
          },
        },
        update: { displayColor: val.displayColor ?? null },
        create: {
          attributeId: attribute.id,
          value: val.value,
          displayColor: val.displayColor ?? null,
        },
      });

      attributeValueMap.set(`${attrDef.slug}:${val.value}`, valueRecord.id);
    }
  }

  console.log(`  ✓ Seeded ${attributeDefinitions.length} Attributes & Values`);
  return attributeValueMap;
};
