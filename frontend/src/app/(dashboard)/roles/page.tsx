'use client';

import React, { useState, useEffect } from 'react';
import {
  useRoles,
  useCreateRole,
  useUpdateRolePermissions,
  useGrantAllRolePermissions,
  useDeleteRole,
} from '@/features/roles/hooks/useRoles';
import { usePermissionGroups } from '@/features/permissions/hooks/usePermissions';
import { RoleList } from '@/features/roles/components/RoleList';
import { RolePermissionMatrix } from '@/features/roles/components/RolePermissionMatrix';
import { CreateRoleModal } from '@/features/roles/components/CreateRoleModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Role } from '@/features/roles/types/role.types';
import { toast } from '@/lib/toast';
import { ShieldCheck, Plus } from 'lucide-react';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const canRead = hasPermission('roles:read');

  // Queries
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles({ page: 1, limit: 100 });
  const { data: groupsResponse } = usePermissionGroups();

  const roles = rolesResponse?.data || [];
  const groups = groupsResponse?.data || [];

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Mutations
  const createMutation = useCreateRole();
  const updatePermissionsMutation = useUpdateRolePermissions();
  const grantAllMutation = useGrantAllRolePermissions();
  const deleteMutation = useDeleteRole();

  const handleCreateSubmit = async (payload: any) => {
    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success(`Role "${payload.name}" created successfully!`);
      if (res?.data) setSelectedRole(res.data);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
      throw err;
    }
  };

  const handleSavePermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      await updatePermissionsMutation.mutateAsync({ roleId, permissionIds });
      toast.success('Role permission matrix updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role permissions');
    }
  };

  const handleGrantAll = async (roleId: string) => {
    try {
      await grantAllMutation.mutateAsync(roleId);
      toast.success('All system permissions granted to role!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to grant permissions');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    try {
      await deleteMutation.mutateAsync(deletingRole.id);
      toast.success(`Role "${deletingRole.name}" deleted successfully.`);
      if (selectedRole?.id === deletingRole.id) {
        setSelectedRole(null);
      }
      setDeletingRole(null);
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete role with assigned users or protected system status.');
      setDeletingRole(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Role Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Role & Permissions"
        description="Assign permission keys, configure role privileges, and grant system access."
        icon={ShieldCheck}
        action={
          <PermissionGate permission="roles:create">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </PermissionGate>
        }
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column — Role List */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Roles</h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {roles.length} roles
            </span>
          </div>

          <RoleList
            roles={roles}
            selectedRoleId={selectedRole?.id || null}
            isLoading={isLoadingRoles}
            onSelectRole={(role) => setSelectedRole(role)}
            onDeleteRole={(role) => setDeletingRole(role)}
          />
        </div>

        {/* Right Column — Permission Matrix */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <RolePermissionMatrix
            selectedRole={selectedRole}
            groups={groups}
            onSavePermissions={handleSavePermissions}
            onGrantAllPermissions={handleGrantAll}
            onDeleteRole={(role) => setDeletingRole(role)}
            isSubmitting={updatePermissionsMutation.isPending || grantAllMutation.isPending}
          />
        </div>
      </div>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingRole}
        title="Delete System Role"
        description="Are you sure you want to delete this role? Roles assigned to active users or marked as system roles cannot be deleted."
        itemName={deletingRole?.name}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}