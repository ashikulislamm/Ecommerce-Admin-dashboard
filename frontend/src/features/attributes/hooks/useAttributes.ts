import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttributeService } from '../services/attribute.service';
import type { AttributeQuery } from '../types/attribute.types';

export const ATTRIBUTE_QUERY_KEYS = {
  all: ['attributes'] as const,
  list: (query: AttributeQuery) => [...ATTRIBUTE_QUERY_KEYS.all, 'list', query] as const,
};

export function useAttributes(query: AttributeQuery = {}) {
  return useQuery({
    queryKey: ATTRIBUTE_QUERY_KEYS.list(query),
    queryFn: () => AttributeService.getAttributes(query),
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => AttributeService.createAttribute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      AttributeService.updateAttribute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTE_QUERY_KEYS.all });
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AttributeService.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTE_QUERY_KEYS.all });
    },
  });
}

export function useCreateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, payload }: { attributeId: string; payload: any }) =>
      AttributeService.createAttributeValue(attributeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTE_QUERY_KEYS.all });
    },
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, valueId }: { attributeId: string; valueId: string }) =>
      AttributeService.deleteAttributeValue(attributeId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTE_QUERY_KEYS.all });
    },
  });
}
