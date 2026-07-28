import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleService } from '../services/role.service';
import type { RoleQuery, CreateRolePayload, UpdateRolePayload } from '../types/role.types';

export const ROLE_QUERY_KEYS = {
  all: ['roles'] as const,
  list: (query: RoleQuery) => [...ROLE_QUERY_KEYS.all, 'list', query] as const,
  detail: (id: string) => [...ROLE_QUERY_KEYS.all, 'detail', id] as const,
};

export function useRoles(query: RoleQuery = {}) {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.list(query),
    queryFn: () => RoleService.getRoles(query),
  });
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.detail(id || ''),
    queryFn: () => RoleService.getRoleById(id!),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => RoleService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      RoleService.updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RoleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all });
    },
  });
}

export function useGrantAllPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => RoleService.grantAllPermissions(roleId),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.detail(roleId) });
    },
  });
}
