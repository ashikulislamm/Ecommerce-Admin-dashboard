import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type {
  ProductQuery,
  CreateSimpleProductPayload,
  CreateVariableProductPayload,
  GenerateVariantsMatrixPayload,
} from '../types/product.types';

export function useProducts(params?: ProductQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });
}

export function useCreateSimpleProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSimpleProductPayload) => productService.createSimpleProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateVariableProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariableProductPayload) => productService.createVariableProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGenerateVariantMatrix() {
  return useMutation({
    mutationFn: (payload: GenerateVariantsMatrixPayload) => productService.generateVariantMatrix(payload),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => productService.updateProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
