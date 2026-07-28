'use client';

import React from 'react';
import type { User, UserStatus } from '../types/user.types';
import { User as UserIcon, Mail, Shield, UserX, UserCheck, Trash2, UserCog, AlertCircle } from 'lucide-react';

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
      <div className="w-full space-y-3 p-4 bg-white rounded-2xl border border-slate-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Users Found</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1 font-medium">
          No users match your current search query or filter options.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
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
                  {u.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  )}
                  {u.status === 'INACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                    </span>
                  )}
                  {u.status === 'SUSPENDED' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onChangeRole(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Change User Role"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>

                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => onChangeStatus(u, 'INACTIVE')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Deactivate User & Revoke Sessions"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onChangeStatus(u, 'ACTIVE')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Activate User"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}

                    {!isSuperAdmin && (
                      <button
                        onClick={() => onDelete(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
