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
import type { Role } from '@/features/roles/types/role.types';
import { ShieldCheck, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Queries
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles({ page: 1, limit: 100 });
  const { data: groupsResponse } = usePermissionGroups();

  const roles = rolesResponse?.data || [];
  const groups = groupsResponse?.data || [];

  // Auto-select first role on load
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
      setFeedback({ type: 'success', message: `Role "${payload.name}" created successfully!` });
      if (res?.data) setSelectedRole(res.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create role' });
      throw err;
    }
  };

  const handleSavePermissions = async (roleId: string, permissionIds: string[]) => {
    setFeedback(null);
    try {
      await updatePermissionsMutation.mutateAsync({ roleId, permissionIds });
      setFeedback({ type: 'success', message: 'Role permission matrix updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update role permissions' });
    }
  };

  const handleGrantAll = async (roleId: string) => {
    setFeedback(null);
    try {
      await grantAllMutation.mutateAsync(roleId);
      setFeedback({ type: 'success', message: 'All system permissions granted to role!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to grant permissions' });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      return;
    }

    setFeedback(null);
    try {
      await deleteMutation.mutateAsync(role.id);
      setFeedback({ type: 'success', message: `Role "${role.name}" deleted successfully.` });
      if (selectedRole?.id === role.id) {
        setSelectedRole(null);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Cannot delete role with assigned users or protected system status.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-lime-50 text-lime-700 border border-lime-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Role Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Create system & custom roles, configure role permissions matrix, and grant privileges
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Alert Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Role List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Available Roles ({roles.length})
          </h3>
          <RoleList
            roles={roles}
            selectedRoleId={selectedRole?.id || null}
            onSelectRole={(r) => setSelectedRole(r)}
            onDeleteRole={handleDeleteRole}
            isLoading={isLoadingRoles}
          />
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-2">
          <RolePermissionMatrix
            selectedRole={selectedRole}
            groups={groups}
            onSavePermissions={handleSavePermissions}
            onGrantAllPermissions={handleGrantAll}
            isSubmitting={updatePermissionsMutation.isPending || grantAllMutation.isPending}
          />
        </div>
      </div>

      {/* Create Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}