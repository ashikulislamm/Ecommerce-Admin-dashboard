'use client';

import React, { useState } from 'react';
import {
  usePermissions,
  useCreatePermission,
  useDeletePermission,
  usePermissionGroups,
} from '@/features/permissions/hooks/usePermissions';
import { PermissionTable } from '@/features/permissions/components/PermissionTable';
import { PermissionGroupMatrix } from '@/features/permissions/components/PermissionGroupMatrix';
import { CreatePermissionModal } from '@/features/permissions/components/CreatePermissionModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Permission } from '@/features/permissions/types/permission.types';
import { toast } from '@/lib/toast';
import {
  Shield,
  Search,
  Plus,
  Table as TableIcon,
  Grid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function PermissionsPage() {
  const { hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isCustomFilter, setIsCustomFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  const canRead = hasPermission('permissions:read');

  // TanStack Queries
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = usePermissions({
    page,
    limit: 10,
    search: search || undefined,
    module: selectedModule || undefined,
    isCustom: isCustomFilter,
  });

  const { data: groupsResponse, isLoading: isLoadingGroups } = usePermissionGroups();

  const permissions = permissionsResponse?.data || [];
  const meta = permissionsResponse?.meta;
  const groups = groupsResponse?.data || [];

  const modules = Array.from(new Set(groups.map((g) => g.module))).filter(Boolean);

  // Mutations
  const createMutation = useCreatePermission();
  const deleteMutation = useDeletePermission();

  const handleCreateSubmit = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success(`Permission "${payload.name}" created successfully!`);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create permission');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPermission) return;
    try {
      await deleteMutation.mutateAsync(deletingPermission.id);
      toast.success(`Permission "${deletingPermission.key}" deleted successfully.`);
      setDeletingPermission(null);
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete permission assigned to active roles.');
      setDeletingPermission(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Permission Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Permission Management"
        description="Configure system action keys, module groupings, and custom permissions."
        icon={Shield}
        action={
          <PermissionGate permission="permissions:create">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Permission
            </button>
          </PermissionGate>
        }
      />

      {/* View Switch */}
      {viewMode === 'table' ? (
        <>
          {/* Control Bar & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search permissions by key, name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div className="relative min-w-[140px]">
                <select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium capitalize"
                >
                  <option value="">All Modules</option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[130px]">
                <select
                  value={isCustomFilter === undefined ? '' : isCustomFilter ? 'true' : 'false'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsCustomFilter(val === '' ? undefined : val === 'true');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
                >
                  <option value="">All Types</option>
                  <option value="false">System Built-in</option>
                  <option value="true">Custom Actions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <PermissionTable
            permissions={permissions}
            isLoading={isLoadingPermissions}
            onEdit={(perm) => toast.info(`Permission Key: ${perm.key}`)}
            onDelete={(perm) => setDeletingPermission(perm)}
          />

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 font-medium">
              <div>
                Showing page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
                <span className="font-bold text-slate-900">{meta.totalPages}</span> ({meta.total}{' '}
                total permissions)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <PermissionGroupMatrix groups={groups} isLoading={isLoadingGroups} />
      )}

      {/* Create Permission Modal */}
      <CreatePermissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingPermission}
        title="Delete Permission"
        description="Are you sure you want to delete this permission key? Permissions assigned to active roles cannot be deleted."
        itemName={deletingPermission?.key}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingPermission(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}