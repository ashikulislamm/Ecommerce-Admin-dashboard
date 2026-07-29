import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../services/category.service';
import type { CategoryQuery } from '../types/category.types';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  tree: () => [...CATEGORY_QUERY_KEYS.all, 'tree'] as const,
  list: (query: CategoryQuery) => [...CATEGORY_QUERY_KEYS.all, 'list', query] as const,
};

export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.tree(),
    queryFn: () => CategoryService.getTree(),
  });
}

export function useCategories(query: CategoryQuery = {}) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(query),
    queryFn: () => CategoryService.getCategories(query),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CategoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      CategoryService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}
