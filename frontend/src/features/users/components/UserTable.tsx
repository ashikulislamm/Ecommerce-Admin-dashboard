'use client';

import React from 'react';
import type { User, UserStatus } from '../types/user.types';
import { User as UserIcon, Mail, Shield, UserX, UserCheck, Trash2, UserCog } from 'lucide-react';
import { Button, Badge, EmptyState, TableSkeleton, Card } from '@/components/ui';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onChangeRole: (user: User) => void;
  onChangeStatus: (user: User, status: UserStatus) => void;
  onDelete: (user: User) => void;
}

export function UserTable({
  users,
  isLoading,
  onChangeRole,
  onChangeStatus,
  onDelete,
}: UserTableProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <TableSkeleton rows={5} columns={6} />
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={UserIcon}
          title="No Users Found"
          description="No users match your current search query or filter options."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
          <tr>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-700" /> Name
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-lime-700" /> Role
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5">
              Status
            </th>
            <th scope="col" className="px-6 py-3.5">
              Created At
            </th>
            <th scope="col" className="px-6 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'N/A';
            const isSuperAdmin = u.role?.name === 'SUPER_ADMIN';

            return (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-3.5 font-bold text-slate-900">{fullName}</td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-600">{u.email}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-lime-100 text-lime-900 border border-lime-200">
                    {u.role?.name || 'No Role'}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <Badge variant={u.status === 'ACTIVE' ? 'active' : u.status === 'INACTIVE' ? 'inactive' : 'suspended'}>
                    {u.status}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onChangeRole(u)}
                      title="Change User Role"
                    >
                      <UserCog className="w-4 h-4 text-emerald-700" />
                    </Button>

                    {u.status === 'ACTIVE' ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onChangeStatus(u, 'INACTIVE')}
                        title="Deactivate User & Revoke Sessions"
                      >
                        <UserX className="w-4 h-4 text-amber-600" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onChangeStatus(u, 'ACTIVE')}
                        title="Activate User"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-700" />
                      </Button>
                    )}

                    {!isSuperAdmin && (
                      <Button
                        variant="destructiveGhost"
                        size="icon-sm"
                        onClick={() => onDelete(u)}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
