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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              User Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage system accounts, role assignments, activation status, and active session revocation
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create User
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

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
            />
          </div>

          <div className="relative min-w-[150px]">
            <select
              value={selectedRoleFilter}
              onChange={(e) => {
                setSelectedRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
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
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
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
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 font-medium">
          <div>
            Showing page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
            <span className="font-bold text-slate-900">{meta.totalPages}</span> ({meta.total} total users)
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