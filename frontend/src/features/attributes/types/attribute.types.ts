export type AttributeType =
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'COLOR_SWATCH'
  | 'IMAGE_SWATCH';

export interface AttributeValueItem {
  id: string;
  attributeId: string;
  value: string;
  displayColor: string | null;
  imageMediaId: string | null;
  imageMedia?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    variantAttributeValues: number;
  };
}

export interface AttributeItem {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  description: string | null;
  values: AttributeValueItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AttributeQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: AttributeType;
}
