'use client';

import React, { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { UserTable } from '@/features/users/components/UserTable';
import { CreateUserModal } from '@/features/users/components/CreateUserModal';
import { UserRoleModal } from '@/features/users/components/UserRoleModal';
import type { User, UserStatus } from '@/features/users/types/user.types';
import {
  Users,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // TanStack Queries
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page,
    limit: 10,
    search: search || undefined,
    roleId: selectedRoleFilter || undefined,
    status: selectedStatusFilter || undefined,
  });

  const { data: rolesResponse } = useRoles({ page: 1, limit: 100 });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;
  const roles = rolesResponse?.data || [];

  // Mutations
  const createMutation = useCreateUser();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const handleCreateSubmit = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ type: 'success', message: 'User created successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user' });
      throw err;
    }
  };

  const handleRoleSubmit = async (userId: string, roleId: string) => {
    setFeedback(null);
    try {
      await updateRoleMutation.mutateAsync({ id: userId, roleId });
      setFeedback({ type: 'success', message: 'User role updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user role' });
      throw err;
    }
  };

  const handleStatusChange = async (user: User, newStatus: UserStatus) => {
    const actionLabel = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} user "${user.email}"?`)) {
      return;
    }

    setFeedback(null);
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, status: newStatus });
      setFeedback({
        type: 'success',
        message: `User status changed to ${newStatus}. ${
          newStatus === 'INACTIVE' ? 'All active refresh sessions were revoked immediately.' : ''
        }`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user status' });
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.email}"?`)) {
      return;
    }

    setFeedback(null);
    try {
      await deleteMutation.mutateAsync(user.id);
      setFeedback({ type: 'success', message: `User "${user.email}" deleted successfully.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/50">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              User Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage system users, role assignments, activation status, and access sessions
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/50 transition-all border border-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Create User
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="relative min-w-[150px]">
            <select
              value={selectedRoleFilter}
              onChange={(e) => {
                setSelectedRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[130px]">
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value as UserStatus | '');
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <UserTable
        users={users}
        isLoading={isLoadingUsers}
        onChangeRole={(user) => setEditingRoleUser(user)}
        onChangeStatus={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div>
            Showing page <span className="font-semibold text-slate-200">{meta.page}</span> of{' '}
            <span className="font-semibold text-slate-200">{meta.totalPages}</span> ({meta.total} total users)
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        roles={roles}
        isSubmitting={createMutation.isPending}
      />

      {/* Change User Role Modal */}
      <UserRoleModal
        user={editingRoleUser}
        roles={roles}
        isOpen={!!editingRoleUser}
        onClose={() => setEditingRoleUser(null)}
        onSubmit={handleRoleSubmit}
        isSubmitting={updateRoleMutation.isPending}
      />
    </div>
  );
}