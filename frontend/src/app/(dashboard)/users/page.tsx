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
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import type { User, UserStatus } from '@/features/users/types/user.types';
import { toast } from '@/lib/toast';
import {
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const canRead = hasPermission('users:read');

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
      toast.success(`User "${payload.email}" created successfully!`);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
      throw err;
    }
  };

  const handleRoleSubmit = async (userId: string, roleId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: userId, roleId });
      toast.success('User role updated successfully!');
      setEditingRoleUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
      throw err;
    }
  };

  const handleStatusChange = async (user: User, newStatus: UserStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, status: newStatus });
      toast.success(
        `User status changed to ${newStatus}. ${
          newStatus === 'INACTIVE' ? 'All active refresh sessions revoked.' : ''
        }`,
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      toast.success(`User "${deletingUser.email}" deleted successfully.`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user.');
      setDeletingUser(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access User Management." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
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

        <PermissionGate permission="users:create">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Create User
          </button>
        </PermissionGate>
      </div>

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
        onDelete={(user) => setDeletingUser(user)}
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingUser}
        title="Delete User Account"
        description="Are you sure you want to permanently delete this user account?"
        itemName={deletingUser?.email}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}