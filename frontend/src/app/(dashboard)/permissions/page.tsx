'use client';

import React, { useState } from 'react';
import {
  usePermissions,
  usePermissionGroups,
  useCreatePermission,
  useDeletePermission,
} from '@/features/permissions/hooks/usePermissions';
import { PermissionTable } from '@/features/permissions/components/PermissionTable';
import { PermissionGroupMatrix } from '@/features/permissions/components/PermissionGroupMatrix';
import { CreatePermissionModal } from '@/features/permissions/components/CreatePermissionModal';
import type { Permission, PermissionGroup } from '@/features/permissions/types/permission.types';
import {
  Shield,
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<'table' | 'matrix'>('table');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // TanStack Queries
  const { data: permissionsResponse, isLoading, error } = usePermissions({
    page,
    limit: 10,
    search: search || undefined,
    module: selectedModule || undefined,
  });

  const { data: groupsResponse, isLoading: isLoadingGroups } = usePermissionGroups();

  // TanStack Mutations
  const createMutation = useCreatePermission();
  const deleteMutation = useDeletePermission();

  const permissions = permissionsResponse?.data || [];
  const meta = permissionsResponse?.meta;
  const groups = groupsResponse?.data || [];

  const handleCreateSubmit = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ type: 'success', message: 'Permission created successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create permission' });
      throw err;
    }
  };

  const handleDelete = async (permission: Permission) => {
    if (!window.confirm(`Are you sure you want to delete permission "${permission.key}"?`)) {
      return;
    }

    setFeedback(null);
    try {
      await deleteMutation.mutateAsync(permission.id);
      setFeedback({ type: 'success', message: `Permission "${permission.key}" deleted successfully.` });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Cannot delete permission.',
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Permission Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Define and manage module-level permissions and system access rules
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all border border-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Create Permission
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

      {/* Control Bar & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        {/* Search Input & Module Select */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search permissions by key, module, action..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:border-emerald-500 focus:outline-none capitalize"
            >
              <option value="">All Modules</option>
              {groups.map((g: PermissionGroup) => (
                <option key={g.id} value={g.module}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'table'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'matrix'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Module Matrix
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'table' ? (
        <>
          <PermissionTable
            permissions={permissions}
            isLoading={isLoading}
            onEdit={(perm: Permission) => setEditingPermission(perm)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div>
                Showing page <span className="font-semibold text-slate-200">{meta.page}</span> of{' '}
                <span className="font-semibold text-slate-200">{meta.totalPages}</span> ({meta.total} total items)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}