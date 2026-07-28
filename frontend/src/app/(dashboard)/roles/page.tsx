'use client';

import React, { useState } from 'react';
import {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGrantAllPermissions,
} from '@/features/roles/hooks/useRoles';
import { usePermissionGroups, usePermissions } from '@/features/permissions/hooks/usePermissions';
import { RoleList } from '@/features/roles/components/RoleList';
import { RolePermissionMatrix } from '@/features/roles/components/RolePermissionMatrix';
import { CreateRoleModal } from '@/features/roles/components/CreateRoleModal';
import type { Role } from '@/features/roles/types/role.types';
import {
  ShieldCheck,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Queries
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles({
    page,
    limit: 10,
    search: search || undefined,
  });

  const { data: groupsResponse, isLoading: isLoadingGroups } = usePermissionGroups();
  const { data: permissionsResponse } = usePermissions({ page: 1, limit: 100 });

  // Selected role detail query for full permission list
  const { data: roleDetailResponse, isLoading: isLoadingDetail } = useRole(selectedRole?.id || null);

  const roles = rolesResponse?.data || [];
  const meta = rolesResponse?.meta;
  const groups = groupsResponse?.data || [];
  const allPermissions = permissionsResponse?.data || [];

  const activeRoleData = roleDetailResponse?.data || selectedRole;

  // Mutations
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const grantAllMutation = useGrantAllPermissions();

  const handleCreateSubmit = async (payload: any) => {
    try {
      const newRole = await createMutation.mutateAsync(payload);
      setFeedback({ type: 'success', message: `Role "${newRole.data.name}" created successfully!` });
      setSelectedRole(newRole.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create role' });
      throw err;
    }
  };

  const handleDelete = async (role: Role) => {
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
        message: err.message || 'Cannot delete role.',
      });
    }
  };

  const handleSaveBatch = async (roleId: string, permissionIds: string[]) => {
    setFeedback(null);
    try {
      await updateMutation.mutateAsync({
        id: roleId,
        payload: { permissionIds },
      });
      setFeedback({ type: 'success', message: 'Role permission matrix updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update role permissions.' });
    }
  };

  const handleGrantAll = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to grant ALL system permissions to this role?')) {
      return;
    }

    setFeedback(null);
    try {
      await grantAllMutation.mutateAsync(roleId);
      setFeedback({ type: 'success', message: 'All system permissions granted to role!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to grant all permissions.' });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-950/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Role Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure system roles and assign permission matrices
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 transition-all border border-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {/* Alert Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid Layout: Role List on Left, Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Role Selection & Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <RoleList
            roles={roles}
            isLoading={isLoadingRoles}
            onSelectRole={(r) => setSelectedRole(r)}
            onEdit={(r) => setSelectedRole(r)}
            onDelete={handleDelete}
            selectedRoleId={activeRoleData?.id}
          />

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Role Permission Matrix */}
        <div className="lg:col-span-7">
          {activeRoleData ? (
            <RolePermissionMatrix
              key={activeRoleData.id}
              role={activeRoleData}
              permissionGroups={groups}
              allPermissions={allPermissions}
              onSaveBatch={handleSaveBatch}
              onGrantAll={handleGrantAll}
              isSaving={updateMutation.isPending || grantAllMutation.isPending}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 min-h-[350px]">
              <Sliders className="w-12 h-12 text-purple-400/60 mb-3" />
              <h3 className="text-lg font-semibold text-slate-200">Select a Role</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click on any role card on the left to configure its permission matrix.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}