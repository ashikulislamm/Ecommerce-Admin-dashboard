import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionService } from '../services/permission.service';
import type { PermissionQuery, CreatePermissionPayload, UpdatePermissionPayload } from '../types/permission.types';

export const PERMISSION_QUERY_KEYS = {
  all: ['permissions'] as const,
  list: (query: PermissionQuery) => [...PERMISSION_QUERY_KEYS.all, 'list', query] as const,
  groups: () => [...PERMISSION_QUERY_KEYS.all, 'groups'] as const,
};

export function usePermissions(query: PermissionQuery = {}) {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.list(query),
    queryFn: () => PermissionService.getPermissions(query),
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.groups(),
    queryFn: () => PermissionService.getPermissionGroups(),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) => PermissionService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePermissionPayload }) =>
      PermissionService.updatePermission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PermissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
    },
  });
}
