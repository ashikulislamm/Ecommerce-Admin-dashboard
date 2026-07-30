import type { AttributeType } from '@prisma/client';

export interface AttributeQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: AttributeType;
}

export interface CreateAttributeInput {
  name: string;
  slug?: string;
  type?: AttributeType;
  description?: string;
}

export interface UpdateAttributeInput {
  name?: string;
  slug?: string;
  type?: AttributeType;
  description?: string;
}

export interface CreateAttributeValueInput {
  attributeId: string;
  value: string;
  displayColor?: string;
  imageMediaId?: string;
}

export interface UpdateAttributeValueInput {
  value?: string;
  displayColor?: string;
  imageMediaId?: string;
}