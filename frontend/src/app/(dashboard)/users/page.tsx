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
import { ConfirmDeleteModal, PageHeader, SearchInput, Card, Pagination, Button } from '@/components/ui';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import type { User, UserStatus, CreateUserPayload } from '@/features/users/types/user.types';
import { toast } from '@/lib/toast';
import { Users, Plus } from 'lucide-react';

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

  const handleCreateSubmit = async (payload: CreateUserPayload) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success(`User "${payload.email}" created successfully!`);
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user';
      toast.error(errorMsg);
      throw err;
    }
  };

  const handleRoleSubmit = async (userId: string, roleId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: userId, roleId });
      toast.success('User role updated successfully!');
      setEditingRoleUser(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user role';
      toast.error(errorMsg);
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(errorMsg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      toast.success(`User "${deletingUser.email}" deleted successfully.`);
      setDeletingUser(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete user.';
      toast.error(errorMsg);
      setDeletingUser(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access User Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="User Management"
        description="Manage system accounts, role assignments, activation status, and active session revocation"
        icon={Users}
        action={
          <PermissionGate permission="users:create">
            <Button variant="emerald" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" /> Create User
            </Button>
          </PermissionGate>
        }
      />

      {/* Control Bar & Filters */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <SearchInput
            value={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search users by name, email..."
          />

          <div className="relative min-w-[150px]">
            <select
              value={selectedRoleFilter}
              onChange={(e) => {
                setSelectedRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium cursor-pointer"
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
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <UserTable
        users={users}
        isLoading={isLoadingUsers}
        onChangeRole={(user) => setEditingRoleUser(user)}
        onChangeStatus={handleStatusChange}
        onDelete={(user) => setDeletingUser(user)}
      />

      {/* Pagination Controls */}
      <Pagination meta={meta} onPageChange={setPage} itemName="users" />

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