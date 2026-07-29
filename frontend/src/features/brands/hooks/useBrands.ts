import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandService } from '../services/brand.service';
import type { BrandQuery } from '../types/brand.types';

export const BRAND_QUERY_KEYS = {
  all: ['brands'] as const,
  list: (query: BrandQuery) => [...BRAND_QUERY_KEYS.all, 'list', query] as const,
};

export function useBrands(query: BrandQuery = {}) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.list(query),
    queryFn: () => BrandService.getBrands(query),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => BrandService.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      BrandService.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
  });
}
